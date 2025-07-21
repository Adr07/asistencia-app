# -*- coding: utf-8 -*-

from odoo import http
from odoo.http import request, Response
import json

class CORSController(http.Controller):
    
    @http.route('/jsonrpc', type='http', auth='none', methods=['OPTIONS'], csrf=False)
    def jsonrpc_options(self, **kwargs):
        """Handle preflight OPTIONS requests for CORS"""
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
            'Access-Control-Max-Age': '86400',
        }
        return Response('', status=200, headers=headers)

# Override the JSON-RPC dispatcher to add CORS headers
original_dispatch = http.JsonRequest._json_response

def _json_response_with_cors(self, result=None, error=None):
    """Add CORS headers to JSON-RPC responses"""
    response = original_dispatch(self, result, error)
    
    # Add CORS headers
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With'
    response.headers['Access-Control-Max-Age'] = '86400'
    
    return response

# Monkey patch the JSON response method
http.JsonRequest._json_response = _json_response_with_cors
