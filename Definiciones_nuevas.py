def get_employee_all_project(self, emp_id=False):    
    project_list = []    
    res = self.env['project.project'].sudo().search([('active', '=', True)])
    for each in res:
        project_list.append({
            'id': each.id,
            'value': each.name,
            'label': each.name,
        })
    return project_list

def get_employee_all_actividad(self, emp_id=False, project_id=False):
        actividad_list = []
        try:
            lista_actividades_obj = self.get_employee_all_actividad_interno(emp_id, project_id)
            for each in lista_actividades_obj:
                actividad_list.append({
                    'id': each.id,
                    'value': each.descripcion,
                    'label': each.descripcion,
                })
        except Exception as e:
            import logging
            logging.error(f"Error en get_employee_all_actividad(emp_id={emp_id}, project_id={project_id}): {str(e)}")
            # También puedes usar print si no tienes logging configurado
            print(f"[ERROR] get_employee_all_actividad(emp_id={emp_id}, project_id={project_id}): {str(e)}")
            # Opcional: devolver una lista vacía o un mensaje de error
        return actividad_list

def attendance_manual(self, long, lat, message, project_id, actividad_id, next_action, observaciones='',no_calidad=False, checkout=False, cambio=False, avance=0):
    message
    
# Modelos 
# hr.attendance:
 
# project = fields.Many2one('project.project', string="Proyecto")
# actividad = fields.Many2one('probotec_attendance.actividad', string="Actividad")
# no_calidad = fields.Boolean('No calidad', default=False)
# observaciones = fields.Char('Observaciones')
# avance = fields.Float('Avance')
 
 
# account.analytic.line:
 
#  Actividades
# project_id
# actividad = fields.Many2one('probotec_attendance.actividad', string="Actividad")
# no_calidad = fields.Boolean('No calidad', default=False)
# observaciones = fields.Char('Observaciones')
# avance = fields.Float('Avance')