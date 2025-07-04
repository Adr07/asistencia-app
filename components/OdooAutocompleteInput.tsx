import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { odooSearch } from '../db/odooApi';

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
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    let active = true;
    setLoading(true);
    const fetchResults = async () => {
      try {
        const domain = [[searchField, 'ilike', query], ...extraDomain];
        const idsResult = await odooSearch({
          model,
          domain,
          uid,
          pass,
          limit: 10,
        });
        let items: any[] = [];
        const idsArr = Array.isArray(idsResult) ? idsResult : [];
        if (idsArr.length > 0) {
          const readRes = await (await import('../db/odooApi')).odooRead({
            model,
            domain: [['id', 'in', idsArr]],
            fields: ['id', labelField],
            uid,
            pass,
          });
          items = Array.isArray(readRes) ? readRes : [];
        }
        if (active) {
          setResults(items);
          setShowDropdown(true);
        }
      } catch {
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
        <View style={styles.dropdown}>
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
