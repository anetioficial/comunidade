import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const RegistrationDetails = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params;
  const [loading, setLoading] = useState(true);
  const [registration, setRegistration] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Simulação de carregamento de dados
  useEffect(() => {
    loadRegistrationDetails();
  }, []);

  const loadRegistrationDetails = () => {
    // Simulação de chamada à API
    setTimeout(() => {
      setRegistration({
        id: parseInt(id),
        name: 'João Silva',
        email: 'joao.silva@example.com',
        plan: 'Júnior',
        planPrice: 'R$ 99,90',
        date: '02/06/2025 14:30',
        linkedinProfile: 'https://linkedin.com/in/joao-silva',
        paymentStatus: 'Aprovado',
        documents: [
          { id: 1, type: 'Documento de Identificação', name: 'rg.pdf' },
          { id: 2, type: 'Comprovação de Experiência', name: 'carteira_trabalho.pdf' }
        ]
      });
      
      setLoading(false);
    }, 1000);
  };

  const handleApprove = () => {
    Alert.alert(
      'Confirmar Aprovação',
      `Deseja realmente aprovar o cadastro de ${registration.name}?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Aprovar',
          onPress: () => {
            // Simulação de chamada à API para aprovar
            setLoading(true);
            setTimeout(() => {
              Alert.alert(
                'Sucesso',
                `Cadastro #${id} aprovado com sucesso!`,
                [
                  {
                    text: 'OK',
                    onPress: () => navigation.goBack()
                  }
                ]
              );
            }, 1000);
          }
        }
      ]
    );
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      Alert.alert('Erro', 'Por favor, forneça uma justificativa para a rejeição.');
      return;
    }
    
    // Simulação de chamada à API para rejeitar
    setLoading(true);
    setShowRejectModal(false);
    
    setTimeout(() => {
      Alert.alert(
        'Sucesso',
        `Cadastro #${id} rejeitado com sucesso!`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    }, 1000);
  };

  const viewDocument = (documentId) => {
    // Em um cenário real, aqui abriria o visualizador de documentos
    Alert.alert('Visualizar Documento', `Abrindo documento ID: ${documentId}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#003366" />
        <Text style={styles.loadingText}>Carregando detalhes do cadastro...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Detalhes do Cadastro #{id}</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.approveButton}
              onPress={handleApprove}
            >
              <Text style={styles.buttonText}>Aprovar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.rejectButton}
              onPress={() => setShowRejectModal(true)}
            >
              <Text style={styles.buttonText}>Rejeitar</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações Pessoais</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Nome</Text>
              <Text style={styles.infoValue}>{registration.name}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{registration.email}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Plano</Text>
              <Text style={styles.infoValue}>{registration.plan} ({registration.planPrice}/ano)</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Data de Cadastro</Text>
              <Text style={styles.infoValue}>{registration.date}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Perfil LinkedIn</Text>
              <Text style={styles.infoValueLink}>{registration.linkedinProfile}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Status do Pagamento</Text>
              <Text style={[styles.infoValue, { color: 'green' }]}>{registration.paymentStatus}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Documentos</Text>
          {registration.documents.map((doc) => (
            <View key={doc.id} style={styles.documentItem}>
              <View style={styles.documentInfo}>
                <Text style={styles.documentType}>{doc.type}</Text>
                <Text style={styles.documentName}>{doc.name}</Text>
              </View>
              <TouchableOpacity
                style={styles.viewButton}
                onPress={() => viewDocument(doc.id)}
              >
                <Text style={styles.viewButtonText}>Visualizar</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
      
      {/* Modal de rejeição */}
      <Modal
        visible={showRejectModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Rejeitar Cadastro</Text>
            <Text style={styles.modalText}>
              Por favor, forneça uma justificativa para a rejeição deste cadastro.
              Esta informação será enviada ao usuário por e-mail.
            </Text>
            <TextInput
              style={styles.modalInput}
              multiline={true}
              numberOfLines={4}
              placeholder="Motivo da rejeição..."
              value={rejectionReason}
              onChangeText={setRejectionReason}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowRejectModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleReject}
              >
                <Text style={styles.modalConfirmButtonText}>Confirmar Rejeição</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  header: {
    padding: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  approveButton: {
    backgroundColor: '#5cb85c',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  rejectButton: {
    backgroundColor: '#d9534f',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 8,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    marginBottom: 15,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  infoValueLink: {
    fontSize: 16,
    fontWeight: '500',
    color: '#003366',
    textDecorationLine: 'underline',
  },
  documentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 5,
    marginBottom: 10,
  },
  documentInfo: {
    flex: 1,
  },
  documentType: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  documentName: {
    fontSize: 14,
    color: '#666',
  },
  viewButton: {
    backgroundColor: '#e6f0ff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  viewButtonText: {
    color: '#003366',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    width: '100%',
    maxWidth: 500,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  modalText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalCancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginRight: 10,
  },
  modalCancelButtonText: {
    color: '#666',
  },
  modalConfirmButton: {
    backgroundColor: '#d9534f',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  modalConfirmButtonText: {
    color: 'white',
    fontWeight: '500',
  },
});

export default RegistrationDetails;
