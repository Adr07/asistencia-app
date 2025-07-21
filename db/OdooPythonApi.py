"""
API de Python para interactuar con Odoo
Este archivo implementa la conexión y métodos para interactuar con Odoo usando Python
Basado en la documentación oficial de Odoo External API
"""

import json
import logging
import xmlrpc.client
from typing import Any, Dict, List, Optional, Union

# Configuración de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class OdooPythonApi:
    """
    Clase para manejar la conexión y operaciones con Odoo usando XML-RPC
    """
    
    def __init__(self, url: str, db: str, username: str = 'admin', password: str = 'admin'):
        """
        Inicializar la conexión a Odoo
        
        Args:
            url: URL del servidor Odoo (ej: http://localhost:8069)
            db: Nombre de la base de datos
            username: Usuario de Odoo (por defecto 'admin')
            password: Contraseña del usuario (por defecto 'admin')
        """
        self.url = url.rstrip('/')
        self.db = db
        self.username = username
        self.password = password
        self.uid = None
        
        # Configurar endpoints
        self.common = xmlrpc.client.ServerProxy(f'{self.url}/xmlrpc/2/common')
        self.models = xmlrpc.client.ServerProxy(f'{self.url}/xmlrpc/2/object')
        
        logger.info(f"Inicializando conexión a Odoo: {self.url} - DB: {self.db}")
    
    def authenticate(self) -> Optional[int]:
        """
        Autenticar usuario y obtener UID
        
        Returns:
            UID del usuario autenticado o None si falla
        """
        try:
            self.uid = self.common.authenticate(self.db, self.username, self.password, {})
            if self.uid:
                logger.info(f"Autenticación exitosa. UID: {self.uid}")
                return self.uid
            else:
                logger.error("Falló la autenticación")
                return None
        except Exception as e:
            logger.error(f"Error en autenticación: {e}")
            return None
    
    def check_access_rights(self, model: str, operation: str = 'read') -> bool:
        """
        Verificar derechos de acceso para un modelo
        
        Args:
            model: Nombre del modelo (ej: 'hr.employee')
            operation: Operación a verificar ('read', 'write', 'create', 'unlink')
        
        Returns:
            True si tiene acceso, False en caso contrario
        """
        if not self.uid:
            logger.error("No hay usuario autenticado")
            return False
        
        try:
            access = self.models.execute_kw(
                self.db, self.uid, self.password,
                model, 'check_access_rights',
                [operation], {'raise_exception': False}
            )
            return access
        except Exception as e:
            logger.error(f"Error verificando derechos de acceso: {e}")
            return False
    
    def search(self, model: str, domain: List = None, offset: int = 0, limit: int = None) -> List[int]:
        """
        Buscar registros en un modelo
        
        Args:
            model: Nombre del modelo
            domain: Dominio de búsqueda (lista de tuplas)
            offset: Offset para paginación
            limit: Límite de registros
        
        Returns:
            Lista de IDs de registros encontrados
        """
        if not self.uid:
            logger.error("No hay usuario autenticado")
            return []
        
        if domain is None:
            domain = []
        
        try:
            args = [domain]
            kwargs = {'offset': offset}
            if limit is not None:
                kwargs['limit'] = limit
            
            ids = self.models.execute_kw(
                self.db, self.uid, self.password,
                model, 'search', args, kwargs
            )
            return ids
        except Exception as e:
            logger.error(f"Error en búsqueda: {e}")
            return []
    
    def read(self, model: str, ids: List[int], fields: List[str] = None) -> List[Dict]:
        """
        Leer registros por IDs
        
        Args:
            model: Nombre del modelo
            ids: Lista de IDs a leer
            fields: Lista de campos a leer (None para todos)
        
        Returns:
            Lista de diccionarios con los datos de los registros
        """
        if not self.uid:
            logger.error("No hay usuario autenticado")
            return []
        
        try:
            kwargs = {}
            if fields:
                kwargs['fields'] = fields
            
            records = self.models.execute_kw(
                self.db, self.uid, self.password,
                model, 'read', [ids], kwargs
            )
            return records
        except Exception as e:
            logger.error(f"Error leyendo registros: {e}")
            return []
    
    def search_read(self, model: str, domain: List = None, fields: List[str] = None, 
                   offset: int = 0, limit: int = None) -> List[Dict]:
        """
        Buscar y leer registros en una sola operación
        
        Args:
            model: Nombre del modelo
            domain: Dominio de búsqueda
            fields: Campos a leer
            offset: Offset para paginación
            limit: Límite de registros
        
        Returns:
            Lista de diccionarios con los datos de los registros
        """
        if not self.uid:
            logger.error("No hay usuario autenticado")
            return []
        
        if domain is None:
            domain = []
        
        try:
            args = [domain]
            kwargs = {'offset': offset}
            if fields:
                kwargs['fields'] = fields
            if limit is not None:
                kwargs['limit'] = limit
            
            records = self.models.execute_kw(
                self.db, self.uid, self.password,
                model, 'search_read', args, kwargs
            )
            return records
        except Exception as e:
            logger.error(f"Error en search_read: {e}")
            return []
    
    def create(self, model: str, vals: Dict) -> Optional[int]:
        """
        Crear un nuevo registro
        
        Args:
            model: Nombre del modelo
            vals: Diccionario con los valores del registro
        
        Returns:
            ID del registro creado o None si falla
        """
        if not self.uid:
            logger.error("No hay usuario autenticado")
            return None
        
        try:
            record_id = self.models.execute_kw(
                self.db, self.uid, self.password,
                model, 'create', [vals]
            )
            logger.info(f"Registro creado con ID: {record_id}")
            return record_id
        except Exception as e:
            logger.error(f"Error creando registro: {e}")
            return None
    
    def write(self, model: str, ids: List[int], vals: Dict) -> bool:
        """
        Actualizar registros existentes
        
        Args:
            model: Nombre del modelo
            ids: Lista de IDs a actualizar
            vals: Diccionario con los valores a actualizar
        
        Returns:
            True si la actualización fue exitosa
        """
        if not self.uid:
            logger.error("No hay usuario autenticado")
            return False
        
        try:
            result = self.models.execute_kw(
                self.db, self.uid, self.password,
                model, 'write', [ids, vals]
            )
            logger.info(f"Registros actualizados: {ids}")
            return result
        except Exception as e:
            logger.error(f"Error actualizando registros: {e}")
            return False
    
    def unlink(self, model: str, ids: List[int]) -> bool:
        """
        Eliminar registros
        
        Args:
            model: Nombre del modelo
            ids: Lista de IDs a eliminar
        
        Returns:
            True si la eliminación fue exitosa
        """
        if not self.uid:
            logger.error("No hay usuario autenticado")
            return False
        
        try:
            result = self.models.execute_kw(
                self.db, self.uid, self.password,
                model, 'unlink', [ids]
            )
            logger.info(f"Registros eliminados: {ids}")
            return result
        except Exception as e:
            logger.error(f"Error eliminando registros: {e}")
            return False
    
    def call_method(self, model: str, method: str, args: List = None, kwargs: Dict = None) -> Any:
        """
        Llamar un método personalizado del modelo
        
        Args:
            model: Nombre del modelo
            method: Nombre del método a llamar
            args: Argumentos posicionales
            kwargs: Argumentos con nombre
        
        Returns:
            Resultado del método llamado
        """
        if not self.uid:
            logger.error("No hay usuario autenticado")
            return None
        
        if args is None:
            args = []
        if kwargs is None:
            kwargs = {}
        
        try:
            result = self.models.execute_kw(
                self.db, self.uid, self.password,
                model, method, args, kwargs
            )
            return result
        except Exception as e:
            logger.error(f"Error llamando método {method}: {e}")
            return None
    
    def get_server_version(self) -> Dict:
        """
        Obtener información de la versión del servidor
        
        Returns:
            Diccionario con información de la versión
        """
        try:
            version_info = self.common.version()
            logger.info(f"Versión del servidor: {version_info}")
            return version_info
        except Exception as e:
            logger.error(f"Error obteniendo versión del servidor: {e}")
            return {}
    
    # Métodos específicos para la aplicación de asistencia
    
    def get_employee_by_user_id(self, user_id: int) -> Optional[Dict]:
        """
        Obtener empleado por ID de usuario
        
        Args:
            user_id: ID del usuario
        
        Returns:
            Diccionario con datos del empleado o None
        """
        employees = self.search_read(
            'hr.employee',
            [['user_id', '=', user_id]],
            fields=['id', 'name', 'user_id'],
            limit=1
        )
        return employees[0] if employees else None
    
    def get_pedir_avance(self, employee_id: int) -> Any:
        """
        Llamar al método get_pedir_avance para saber si se debe pedir avance
        
        Args:
            employee_id: ID del empleado
        
        Returns:
            Resultado del método
        """
        return self.call_method('hr.attendance', 'get_pedir_avance', [employee_id])
    
    def get_employee_all_project(self, employee_id: int) -> List[Dict]:
        """
        Obtener todos los proyectos asignados al empleado
        
        Args:
            employee_id: ID del empleado
        
        Returns:
            Lista de proyectos
        """
        result = self.call_method('hr.attendance', 'get_employee_all_project', [employee_id])
        return result if result else []
    
    def get_employee_all_actividad(self, employee_id: int, project_id: int) -> List[Dict]:
        """
        Obtener todas las actividades de un proyecto para un empleado
        
        Args:
            employee_id: ID del empleado
            project_id: ID del proyecto
        
        Returns:
            Lista de actividades
        """
        result = self.call_method(
            'hr.attendance', 
            'get_employee_all_actividad', 
            [[], employee_id, project_id]
        )
        return result if result else []
    
    def attendance_manual(self, employee_id: int, longitude: float, latitude: float,
                         message: str, project_id: int, actividad_id: int,
                         next_action: str, observations: str, no_calidad: bool,
                         checkout: bool, cambio: bool, avance: float) -> Any:
        """
        Registrar asistencia manual
        
        Args:
            employee_id: ID del empleado
            longitude: Longitud GPS
            latitude: Latitud GPS
            message: Mensaje
            project_id: ID del proyecto
            actividad_id: ID de la actividad
            next_action: Próxima acción
            observations: Observaciones
            no_calidad: Sin calidad
            checkout: Es checkout
            cambio: Es cambio
            avance: Porcentaje de avance
        
        Returns:
            Resultado del registro de asistencia
        """
        args = [
            [employee_id],      # array de IDs
            employee_id,        # El id del empleado
            longitude,          # long
            latitude,           # lat
            message,            # message
            project_id,         # project_id
            actividad_id,       # actividad_id
            next_action,        # next_action
            observations,       # observaciones
            no_calidad,         # no_calidad
            checkout,           # checkout
            cambio,             # cambio
            avance              # avance
        ]
        
        return self.call_method('hr.employee', 'attendance_manual', args)


# Función de configuración para crear una instancia de la API
def create_odoo_api(url: str, db: str, username: str = 'admin', password: str = 'admin') -> OdooPythonApi:
    """
    Crear y configurar una instancia de la API de Odoo
    
    Args:
        url: URL del servidor Odoo
        db: Nombre de la base de datos
        username: Usuario (por defecto 'admin')
        password: Contraseña (por defecto 'admin')
    
    Returns:
        Instancia configurada de OdooPythonApi
    """
    api = OdooPythonApi(url, db, username, password)
    
    # Autenticar automáticamente
    if api.authenticate():
        logger.info("API de Odoo configurada y autenticada correctamente")
        return api
    else:
        logger.error("Error en la configuración de la API de Odoo")
        raise Exception("No se pudo autenticar con Odoo")


# Ejemplo de uso
if __name__ == "__main__":
    # Configuración de ejemplo
    URL = "<insert server URL>"  # ej: "http://localhost:8069"
    DB = "<insert database name>"  # ej: "mi_database"
    USERNAME = "admin"
    PASSWORD = "<insert password for your admin user>"  # ej: "admin"
    
    try:
        # Crear instancia de la API
        odoo_api = create_odoo_api(URL, DB, USERNAME, PASSWORD)
        
        # Obtener información del servidor
        version_info = odoo_api.get_server_version()
        print(f"Información del servidor: {version_info}")
        
        # Ejemplo: buscar empleados
        employees = odoo_api.search_read('hr.employee', [], ['name', 'user_id'], limit=5)
        print(f"Empleados encontrados: {len(employees)}")
        for emp in employees:
            print(f"- {emp['name']} (ID: {emp['id']})")
            
    except Exception as e:
        logger.error(f"Error en ejemplo de uso: {e}")
