import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getEmployeeAllProjects, getProjectActivities } from '../db/odooApi';

interface OdooAutocompleteInputProps {
  model: string; // 'project.project' o 'project.task'
  searchField: string; // 'name' o campo a buscar
  placeholder?: string;
  onSelect: (item: any) => void;
  value?: any;
  uid: number;
  pass: string;
  extraDomain?: any[];
  labelField?: string; // por defecto 'name'
}

export const OdooAutocompleteInput: React.FC<OdooAutocompleteInputProps> = ({
  model,
  searchField,
  placeholder,
  onSelect,
  value,
  uid,
  pass,
  extraDomain = [],
  labelField = 'name',
  ...props
}) => {
  // Excluir proyecto interno si es project.project
  let domain = [...extraDomain];
  if (model === 'project.project') {
    console.log('[OdooAutocompleteInput] Dominio inicial:', JSON.stringify(domain));
    // Filtrar proyecto interno usando OR condition
    domain.unshift(
      '|',
      ['id', '!=', 1],
      ['name', 'not ilike', 'interno']
    );
    // Asegurar que solo proyectos activos
    domain.unshift('&');
    domain.push(['active', '=', true]);
    console.log('[OdooAutocompleteInput] Dominio final:', JSON.stringify(domain));
  }
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    // Solo buscar si hay suficiente texto
    if (query.length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    let active = true;
    setLoading(true);
    const fetchResults = async () => {
      try {
        let items: any[] = [];
        if (model === 'project.project') {
          // Buscar proyectos por nombre
          const proyectos = await getEmployeeAllProjects({ uid, pass });
          items = Array.isArray(proyectos)
            ? proyectos.filter((p: any) =>
                p[labelField]?.toLowerCase().includes(query.toLowerCase()) &&
                p.id !== 1 &&
                !(p[labelField]?.toLowerCase().includes('interno'))
              )
            : [];
        } else if (model === 'project.task' || model === 'project.activity') {
          // Buscar actividades por nombre, requiere project_id en extraDomain
          const projectIdFilter = extraDomain.find((d: any) => Array.isArray(d) && d[0] === 'project_id');
          const projectId = projectIdFilter ? projectIdFilter[2] : null;
          if (projectId) {
            const actividades = await getProjectActivities({ uid, pass, project_id: projectId });
            items = Array.isArray(actividades)
              ? actividades.filter((a: any) =>
                  a[labelField]?.toLowerCase().includes(query.toLowerCase())
                )
              : [];
          }
        }
        if (active) {
          setResults(items);
          setShowDropdown(true);
        }
      } catch (e) {
        setResults([]);
        setShowDropdown(false);
      } finally {
        setLoading(false);
      }
    };
    const timeout = setTimeout(fetchResults, 250);
    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [query, model, searchField, uid, pass, extraDomain, labelField]);

  // Sincronizar el valor externo (value) con el input, pero solo si el usuario no está escribiendo
  useEffect(() => {
    if (value && value[labelField] && value[labelField] !== query) {
      setQuery(value[labelField]);
    }
    if (!value && query !== '') {
      setQuery('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleSelect = (item: any) => {
    setQuery(item[labelField]);
    setShowDropdown(false);
    onSelect(item);
  };

  return (
    <View style={styles.container}>
      {/* Input de búsqueda siempre visible */}
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={query}
        onChangeText={text => {
          setQuery(text);
          setShowDropdown(true);
          if (text === '') {
            onSelect(null);
          }
        }}
        onFocus={() => setShowDropdown(true)}
        autoCorrect={false}
        autoCapitalize="none"
      />
      {loading && <ActivityIndicator size="small" style={styles.loading} />}
      {showDropdown && (
        <View style={[styles.dropdown, { padding: 16 }]}> {/* 1rem = 16px */}
          {/* Cuadro de búsqueda dentro del modal (opcional, aquí es el mismo input) */}
          {/* Lista de resultados filtrados */}
          {results.length > 0 ? (
            <FlatList
              data={results}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleSelect(item)} style={styles.item}>
                  <Text>{item[labelField]}</Text>
                </TouchableOpacity>
              )}
              keyboardShouldPersistTaps="handled"
            />
          ) : (
            !loading && query.length >= 2 && (
              <Text style={{ padding: 10, color: '#888' }}>No hay resultados</Text>
            )
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 10, backgroundColor: '#fff' },
  loading: { position: 'absolute', right: 10, top: 12 },
  dropdown: { position: 'absolute', top: 48, left: 0, right: 0, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', borderRadius: 6, zIndex: 10, maxHeight: 180 },
  item: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
});
