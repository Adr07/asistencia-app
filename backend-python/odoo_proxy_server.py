"""
Servidor proxy para manejar las peticiones a Odoo sin problemas de CORS
Este servidor actúa como intermediario entre la aplicación React Native y Odoo
"""

import logging
import os
import sys

from flask import Flask, jsonify, request
from flask_cors import CORS

# Agregar el directorio padre al path para importar OdooPythonApi
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'db'))

try:
    from OdooPythonApi import create_odoo_api
except ImportError as e:
    print(f"Error importando OdooPythonApi: {e}")
    print("Asegúrate de que el archivo OdooPythonApi.py esté en la carpeta db/")
    sys.exit(1)

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Habilitar CORS para todas las rutas

# Configuración por defecto (puedes cambiar estos valores)
DEFAULT_CONFIG = {
    'url': 'https://registro.sinerkia-dev.com',
    'db': 'registro',
    'username': 'admin',
    'password': 'admin'
}

@app.route('/health', methods=['GET'])
def health_check():
    """Endpoint de salud del servidor"""
    return jsonify({'status': 'ok', 'message': 'Servidor proxy Odoo funcionando'})

@app.route('/api/authenticate', methods=['POST'])
def authenticate():
    """
    Endpoint para autenticación de usuarios
    
    Request JSON:
    {
        "username": "usuario",
        "password": "contraseña",
        "url": "https://servidor-odoo.com" (opcional),
        "db": "nombre_db" (opcional)
    }
    
    Response JSON:
    {
        "success": true/false,
        "uid": number/null,
        "isAdmin": boolean,
        "error": "mensaje_error" (solo si success=false)
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'uid': None,
                'isAdmin': False,
                'error': 'No se recibieron datos JSON'
            }), 400
        
        username = data.get('username')
        password = data.get('password')
        url = data.get('url', DEFAULT_CONFIG['url'])
        db = data.get('db', DEFAULT_CONFIG['db'])
        
        if not username or not password:
            return jsonify({
                'success': False,
                'uid': None,
                'isAdmin': False,
                'error': 'Usuario y contraseña son requeridos'
            }), 400
        
        logger.info(f"Intentando autenticación para usuario: {username}")
        
        # Crear instancia de la API de Odoo
        odoo_api = create_odoo_api(url, db, username, password)
        
        if not odoo_api.uid:
            return jsonify({
                'success': False,
                'uid': None,
                'isAdmin': False,
                'error': 'Usuario o contraseña incorrectos'
            })
        
        # Verificar si es administrador
        is_admin = False
        try:
            users = odoo_api.search_read(
                'res.users',
                [['id', '=', odoo_api.uid]],
                fields=['groups_id'],
                limit=1
            )
            
            if users and len(users) > 0:
                groups = users[0].get('groups_id', [])
                # Verificar si tiene el grupo de administrador (ID 1)
                is_admin = any(
                    (g[0] if isinstance(g, list) else g) == 1 
                    for g in groups
                )
        except Exception as e:
            logger.warning(f"Error verificando permisos de admin: {e}")
            # No es un error crítico, continuar sin permisos de admin
        
        logger.info(f"Autenticación exitosa. UID: {odoo_api.uid}, Admin: {is_admin}")
        
        return jsonify({
            'success': True,
            'uid': odoo_api.uid,
            'isAdmin': is_admin
        })
        
    except Exception as e:
        logger.error(f"Error en autenticación: {e}")
        return jsonify({
            'success': False,
            'uid': None,
            'isAdmin': False,
            'error': str(e)
        }), 500

@app.route('/api/employee/<int:uid>', methods=['POST'])
def get_employee_info(uid):
    """
    Obtener información del empleado por UID
    """
    try:
        data = request.get_json()
        password = data.get('password')
        url = data.get('url', DEFAULT_CONFIG['url'])
        db = data.get('db', DEFAULT_CONFIG['db'])
        
        # Usar el username del uid para crear la conexión
        # Esto requiere obtener primero el username del uid
        odoo_api = create_odoo_api(url, db, 'admin', 'admin')  # Conexión temporal como admin
        
        # Obtener info del usuario
        users = odoo_api.search_read(
            'res.users',
            [['id', '=', uid]],
            fields=['login'],
            limit=1
        )
        
        if not users:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        username = users[0]['login']
        
        # Crear conexión con las credenciales correctas
        odoo_api = create_odoo_api(url, db, username, password)
        
        # Obtener empleado
        employee = odoo_api.get_employee_by_user_id(uid)
        
        return jsonify({
            'success': True,
            'employee': employee
        })
        
    except Exception as e:
        logger.error(f"Error obteniendo información del empleado: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/projects/<int:employee_id>', methods=['POST'])
def get_employee_projects(employee_id):
    """
    Obtener proyectos del empleado
    """
    try:
        data = request.get_json()
        password = data.get('password')
        username = data.get('username')
        url = data.get('url', DEFAULT_CONFIG['url'])
        db = data.get('db', DEFAULT_CONFIG['db'])
        
        odoo_api = create_odoo_api(url, db, username, password)
        projects = odoo_api.get_employee_all_project(employee_id)
        
        return jsonify({
            'success': True,
            'projects': projects
        })
        
    except Exception as e:
        logger.error(f"Error obteniendo proyectos: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/activities/<int:employee_id>/<int:project_id>', methods=['POST'])
def get_project_activities(employee_id, project_id):
    """
    Obtener actividades del proyecto
    """
    try:
        data = request.get_json()
        password = data.get('password')
        username = data.get('username')
        url = data.get('url', DEFAULT_CONFIG['url'])
        db = data.get('db', DEFAULT_CONFIG['db'])
        
        odoo_api = create_odoo_api(url, db, username, password)
        activities = odoo_api.get_employee_all_actividad(employee_id, project_id)
        
        return jsonify({
            'success': True,
            'activities': activities
        })
        
    except Exception as e:
        logger.error(f"Error obteniendo actividades: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/attendance', methods=['POST'])
def register_attendance():
    """
    Registrar asistencia manual
    """
    try:
        data = request.get_json()
        
        required_fields = ['username', 'password', 'employee_id', 'project_id', 
                          'actividad_id', 'next_action', 'observations']
        
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Campo requerido faltante: {field}'
                }), 400
        
        username = data['username']
        password = data['password']
        url = data.get('url', DEFAULT_CONFIG['url'])
        db = data.get('db', DEFAULT_CONFIG['db'])
        
        odoo_api = create_odoo_api(url, db, username, password)
        
        result = odoo_api.attendance_manual(
            employee_id=data['employee_id'],
            longitude=data.get('longitude', 0.0),
            latitude=data.get('latitude', 0.0),
            message=data.get('message', ''),
            project_id=data['project_id'],
            actividad_id=data['actividad_id'],
            next_action=data['next_action'],
            observations=data['observations'],
            no_calidad=data.get('no_calidad', False),
            checkout=data.get('checkout', False),
            cambio=data.get('cambio', False),
            avance=data.get('avance', 0.0)
        )
        
        return jsonify({
            'success': True,
            'result': result
        })
        
    except Exception as e:
        logger.error(f"Error registrando asistencia: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('DEBUG', 'True').lower() == 'true'
    
    logger.info(f"Iniciando servidor proxy Odoo en puerto {port}")
    logger.info(f"Configuración: {DEFAULT_CONFIG}")
    
    app.run(host='0.0.0.0', port=port, debug=debug)
