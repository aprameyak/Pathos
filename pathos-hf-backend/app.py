from flask import Flask, request, jsonify
from flask_cors import CORS
from deepface import DeepFace
import cv2
import numpy as np
from base64 import b64decode
import os
import logging
import threading

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Optimize for 2 CPU cores and 16GB RAM
import os
os.environ['OMP_NUM_THREADS'] = '2'
os.environ['MKL_NUM_THREADS'] = '2'
os.environ['OPENBLAS_NUM_THREADS'] = '2'
os.environ['VECLIB_MAXIMUM_THREADS'] = '2'
os.environ['NUMEXPR_NUM_THREADS'] = '2'

# Global configuration for Hugging Face Spaces
CONFIG = {
    'max_image_size': 1024,  # Increased for 16GB RAM
    'confidence_threshold': 0.3,
    'max_faces': 10,
    'timeout': 30,
    'cache_size': 100  # Number of cached results
}

# Simple cache for results
result_cache = {}
cache_lock = threading.Lock()

def get_cache_key(frame_data):
    """Generate a simple hash for caching"""
    return hash(frame_data[:1000])  # Use first 1000 chars for hash

def get_cached_result(cache_key):
    """Get cached result if available"""
    with cache_lock:
        return result_cache.get(cache_key)

def set_cached_result(cache_key, result):
    """Cache result"""
    with cache_lock:
        # Simple LRU cache implementation
        if len(result_cache) >= CONFIG['cache_size']:
            # Remove oldest entry
            oldest_key = next(iter(result_cache))
            del result_cache[oldest_key]
        result_cache[cache_key] = result

# Health check endpoint
@app.route('/', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy', 
        'service': 'pathos-emotion-api',
        'version': '2.0.0',
        'deployment': 'huggingface-spaces',
        'config': {
            'max_image_size': CONFIG['max_image_size'],
            'max_faces': CONFIG['max_faces'],
            'cpu_cores': 2,
            'ram_gb': 16
        }
    })

@app.route('/analyze_screen', methods=['POST', 'OPTIONS'])
def analyze_screen_emotion():
    
    if request.method == 'OPTIONS':
        response = jsonify(success=True)
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response

    try:
        logger.info("Received emotion analysis request")
        
        # Get frame data from request
        frame_data = request.json.get('frame')
        if not frame_data:
            logger.error("No frame data provided")
            return jsonify({'error': 'No frame data provided'}), 400

        # Check cache first
        cache_key = get_cache_key(frame_data)
        cached_result = get_cached_result(cache_key)
        if cached_result:
            logger.info("Returning cached result")
            return jsonify(cached_result)

        # Remove data URL prefix if present
        if frame_data.startswith('data:image'):
            frame_data = frame_data.split(',')[1]

        # Decode base64 image
        img_bytes = b64decode(frame_data)
        nparr = np.frombuffer(img_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if frame is None:
            logger.error("Invalid image data")
            return jsonify({'error': 'Invalid image data'}), 400

        # Resize image for optimal performance on 2 CPU cores
        height, width = frame.shape[:2]
        if max(height, width) > CONFIG['max_image_size']:
            scale = CONFIG['max_image_size'] / max(height, width)
            new_width = int(width * scale)
            new_height = int(height * scale)
            frame = cv2.resize(frame, (new_width, new_height))
            logger.info(f"Resized image to {new_width}x{new_height}")

        # Analyze emotions using DeepFace with optimizations
        logger.info("Starting emotion analysis")
        results = DeepFace.analyze(
            frame,
            actions=['emotion'],
            enforce_detection=False,
            detector_backend='opencv',
            silent=True  # Reduce logging for better performance
        )

        # Ensure results is a list
        if not isinstance(results, list):
            results = [results]

        # Limit number of faces for performance
        if len(results) > CONFIG['max_faces']:
            results = results[:CONFIG['max_faces']]
            logger.info(f"Limited to {CONFIG['max_faces']} faces")

        # Process and format results
        processed_results = []
        for result in results:
            # Convert emotion scores to float
            emotion_scores = {
                key: float(val) for key, val in result['emotion'].items()
            }

            # Handle region data
            raw_region = result.get('region')
            if not raw_region:
                raw_region = (0, 0, frame.shape[1], frame.shape[0])

            # Convert region to proper format
            if isinstance(raw_region, (tuple, list)):
                if len(raw_region) == 4:
                    x_val, y_val, w_val, h_val = raw_region
                else:
                    x_val, y_val, w_val, h_val = 0, 0, frame.shape[1], frame.shape[0]
                region_dict = {
                    'x': x_val,
                    'y': y_val,
                    'w': w_val,
                    'h': h_val
                }
            elif isinstance(raw_region, dict):
                x_val = raw_region.get('x') if raw_region.get('x') is not None else 0
                y_val = raw_region.get('y') if raw_region.get('y') is not None else 0
                w_val = raw_region.get('w') if raw_region.get('w') is not None else frame.shape[1]
                h_val = raw_region.get('h') if raw_region.get('h') is not None else frame.shape[0]
                region_dict = {
                    'x': x_val,
                    'y': y_val,
                    'w': w_val,
                    'h': h_val
                }
            else:
                region_dict = {
                    'x': 0,
                    'y': 0,
                    'w': frame.shape[1],
                    'h': frame.shape[0]
                }

            # Ensure region values are integers
            region_converted = {
                'x': int(region_dict['x']),
                'y': int(region_dict['y']),
                'w': int(region_dict['w']),
                'h': int(region_dict['h'])
            }

            processed_results.append({
                'dominant_emotion': result['dominant_emotion'],
                'emotion_scores': emotion_scores,
                'region': region_converted
            })

        # Cache the result
        set_cached_result(cache_key, processed_results)

        logger.info(f"Analysis complete. Found {len(processed_results)} faces")
        return jsonify(processed_results)

    except Exception as e:
        logger.error(f"Error processing frame: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    """Detailed health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'pathos-emotion-api',
        'version': '2.0.0',
        'deployment': 'huggingface-spaces',
        'hardware': {
            'cpu_cores': 2,
            'ram_gb': 16,
            'optimized': True
        },
        'config': CONFIG,
        'cache': {
            'size': len(result_cache),
            'max_size': CONFIG['cache_size']
        },
        'endpoints': {
            'analyze_screen': '/analyze_screen',
            'health': '/health'
        }
    })

@app.route('/config', methods=['GET'])
def get_config():
    """Get current configuration"""
    return jsonify({
        'config': CONFIG,
        'hardware': {
            'cpu_cores': 2,
            'ram_gb': 16
        }
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 7860))  # Hugging Face Spaces default port
    debug = os.environ.get('DEBUG', 'False').lower() == 'true'
    
    logger.info(f"Starting Pathos Emotion API on port {port}")
    logger.info(f"Optimized for 2 CPU cores and 16GB RAM")
    logger.info(f"Debug mode: {debug}")
    
    app.run(host='0.0.0.0', port=port, debug=debug, threaded=True)
