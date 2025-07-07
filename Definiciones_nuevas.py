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