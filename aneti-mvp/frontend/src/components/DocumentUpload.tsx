import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DocumentUploadProps {
  selectedPlan: string | null;
  onDocumentUpload: (documentType: string, file: any) => void;
  linkedinProfile: string;
  onLinkedinChange: (value: string) => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  selectedPlan,
  onDocumentUpload,
  linkedinProfile,
  onLinkedinChange
}) => {
  const [documents, setDocuments] = useState({
    idDocument: null,
    experienceDocument: null
  });

  // Simulação de seleção de documento
  const handleSelectDocument = (documentType: string) => {
    // Em um cenário real, aqui seria usado o ImagePicker ou DocumentPicker
    // para selecionar arquivos do dispositivo
    
    // Simulação de arquivo selecionado
    const mockFile = {
      name: documentType === 'idDocument' ? 'documento_identidade.pdf' : 'comprovante_experiencia.pdf',
      type: 'application/pdf',
      size: 1024 * 1024 * 2, // 2MB
      uri: 'file://mock-path/' + (documentType === 'idDocument' ? 'documento_identidade.pdf' : 'comprovante_experiencia.pdf')
    };
    
    setDocuments(prev => ({
      ...prev,
      [documentType]: mockFile
    }));
    
    onDocumentUpload(documentType, mockFile);
  };

  const isPlanPublic = selectedPlan === 'public';

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Documentos necessários</Text>
      
      <View style={styles.documentItem}>
        <Text style={styles.documentLabel}>
          Documento de identificação <Text style={styles.requiredMark}>*</Text>
        </Text>
        <TouchableOpacity 
          style={styles.uploadButton}
          onPress={() => handleSelectDocument('idDocument')}
        >
          <Ionicons name="document-outline" size={24} color="#003366" />
          <Text style={styles.uploadButtonText}>
            {documents.idDocument ? 'Documento selecionado' : 'Selecionar documento'}
          </Text>
        </TouchableOpacity>
        {documents.idDocument && (
          <Text style={styles.fileName}>{documents.idDocument.name}</Text>
        )}
        <Text style={styles.helperText}>
          RG, CNH, Passaporte ou Carteira de Trabalho
        </Text>
      </View>
      
      <View style={styles.documentItem}>
        <Text style={styles.documentLabel}>
          Comprovação de experiência em T.I. <Text style={styles.requiredMark}>*</Text>
        </Text>
        <TouchableOpacity 
          style={styles.uploadButton}
          onPress={() => handleSelectDocument('experienceDocument')}
        >
          <Ionicons name="document-outline" size={24} color="#003366" />
          <Text style={styles.uploadButtonText}>
            {documents.experienceDocument ? 'Documento selecionado' : 'Selecionar documento'}
          </Text>
        </TouchableOpacity>
        {documents.experienceDocument && (
          <Text style={styles.fileName}>{documents.experienceDocument.name}</Text>
        )}
        <Text style={styles.helperText}>
          {isPlanPublic 
            ? "Currículo ou documento formal" 
            : "Carteira de trabalho, declaração de empresa ou certificados"}
        </Text>
      </View>
      
      <View style={styles.documentItem}>
        <Text style={styles.documentLabel}>Perfil LinkedIn (opcional)</Text>
        <TextInput
          style={styles.input}
          placeholder="https://www.linkedin.com/in/seu-perfil"
          value={linkedinProfile}
          onChangeText={onLinkedinChange}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  documentItem: {
    marginBottom: 20,
  },
  documentLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  requiredMark: {
    color: 'red',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
  },
  uploadButtonText: {
    marginLeft: 10,
    color: '#003366',
    fontSize: 16,
  },
  fileName: {
    marginTop: 5,
    fontSize: 14,
    color: '#666',
  },
  helperText: {
    marginTop: 5,
    fontSize: 12,
    color: '#888',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
  },
});

export default DocumentUpload;
