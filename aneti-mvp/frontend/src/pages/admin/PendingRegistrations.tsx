import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';

const PendingRegistrations = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [registrations, setRegistrations] = useState([]);

  // Simulação de carregamento de dados
  useEffect(() => {
    loadRegistrations();
  }, []);

  const loadRegistrations = () => {
    // Simulação de chamada à API
    setTimeout(() => {
      setRegistrations([
        { id: 1, name: 'João Silva', email: 'joao.silva@example.com', plan: 'Júnior', date: '02/06/2025 14:30' },
        { id: 2, name: 'Ana Souza', email: 'ana.souza@example.com', plan: 'Pleno', date: '02/06/2025 11:20' },
        { id: 3, name: 'Pedro Costa', email: 'pedro.costa@example.com', plan: 'Público', date: '01/06/2025 18:45' },
        { id: 4, name: 'Lucia Ferreira', email: 'lucia.ferreira@example.com', plan: 'Sênior', date: '01/06/2025 09:15' }
      ]);
      
      setLoading(false);
      setRefreshing(false);
    }, 1000);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadRegistrations();
  };

  const filteredRegistrations = registrations.filter(reg => {
    const matchesSearch = searchQuery === '' || 
      reg.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      reg.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPlan = selectedPlan === '' || reg.plan === selectedPlan;
    
    return matchesSearch && matchesPlan;
  });

  const viewRegistrationDetails = (id) => {
    navigation.navigate('RegistrationDetails', { id });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#003366" />
        <Text style={styles.loadingText}>Carregando cadastros pendentes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cadastros Pendentes</Text>
      
      <View style={styles.filtersContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nome ou email"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedPlan}
            onValueChange={(itemValue) => setSelectedPlan(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Todos os planos" value="" />
            <Picker.Item label="Público" value="Público" />
            <Picker.Item label="Júnior" value="Júnior" />
            <Picker.Item label="Pleno" value="Pleno" />
            <Picker.Item label="Sênior" value="Sênior" />
          </Picker>
        </View>
      </View>
      
      <ScrollView 
        style={styles.registrationsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredRegistrations.length > 0 ? (
          filteredRegistrations.map((registration) => (
            <TouchableOpacity
              key={registration.id}
              style={styles.registrationItem}
              onPress={() => viewRegistrationDetails(registration.id)}
            >
              <View style={styles.registrationHeader}>
                <Text style={styles.registrationName}>{registration.name}</Text>
                <Text style={styles.registrationPlan}>{registration.plan}</Text>
              </View>
              <Text style={styles.registrationEmail}>{registration.email}</Text>
              <View style={styles.registrationFooter}>
                <Text style={styles.registrationDate}>{registration.date}</Text>
                <TouchableOpacity 
                  style={styles.detailsButton}
                  onPress={() => viewRegistrationDetails(registration.id)}
                >
                  <Text style={styles.detailsButtonText}>Detalhes</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum cadastro pendente encontrado</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  filtersContainer: {
    marginBottom: 15,
  },
  searchInput: {
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
  },
  picker: {
    height: 50,
  },
  registrationsList: {
    flex: 1,
  },
  registrationItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  registrationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  registrationName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  registrationPlan: {
    fontSize: 14,
    color: '#003366',
    fontWeight: '500',
  },
  registrationEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  registrationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  registrationDate: {
    fontSize: 14,
    color: '#888',
  },
  detailsButton: {
    backgroundColor: '#003366',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  detailsButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default PendingRegistrations;
