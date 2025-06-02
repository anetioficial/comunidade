import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import RegisterForm from '../components/RegisterForm';
import PlanSelection from '../components/PlanSelection';
import PaymentForm from '../components/PaymentForm';
import DocumentUpload from '../components/DocumentUpload';

const RegisterPage = () => {
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    confirmEmail: '',
    password: '',
    confirmPassword: '',
    selectedPlan: null,
    documents: {},
    linkedinProfile: '',
    paymentInfo: null
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Dados de exemplo para planos
  const plans = [
    { id: 'public', name: 'Público', price: 0, isPublic: true, description: 'Acesso básico à comunidade' },
    { id: 'junior', name: 'Júnior', price: 99.90, isPublic: false, description: 'Para profissionais em início de carreira' },
    { id: 'pleno', name: 'Pleno', price: 119.90, isPublic: false, description: 'Para profissionais com experiência intermediária' },
    { id: 'senior', name: 'Sênior', price: 129.90, isPublic: false, description: 'Para profissionais experientes' }
  ];

  const handleFormDataChange = (data) => {
    setFormData({ ...formData, ...data });
  };

  const handlePlanSelect = (planId) => {
    setFormData({ ...formData, selectedPlan: planId });
  };

  const handleDocumentUpload = (documentType, file) => {
    setFormData({
      ...formData,
      documents: {
        ...formData.documents,
        [documentType]: file
      }
    });
  };

  const handlePaymentSubmit = (paymentInfo) => {
    setFormData({ ...formData, paymentInfo });
    handleNextStep();
  };

  const handleNextStep = () => {
    // Validação básica por etapa
    if (currentStep === 1) {
      if (!formData.name || !formData.email || !formData.confirmEmail || !formData.password || !formData.confirmPassword) {
        setError('Todos os campos são obrigatórios');
        return;
      }
      if (formData.email !== formData.confirmEmail) {
        setError('Os e-mails não conferem');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('As senhas não conferem');
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.selectedPlan) {
        setError('Selecione um plano');
        return;
      }
    } else if (currentStep === 3) {
      const requiredDocs = ['idDocument', 'experienceDocument'];
      const missingDocs = requiredDocs.filter(doc => !formData.documents[doc]);
      if (missingDocs.length > 0) {
        setError('Todos os documentos obrigatórios devem ser enviados');
        return;
      }
    }

    setError('');
    setCurrentStep(currentStep + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      // Simulação de envio para API
      console.log('Dados do formulário:', formData);

      // Em um cenário real, aqui seria feita a chamada para a API
      setTimeout(() => {
        setLoading(false);
        // Redirecionar para página de sucesso ou pendente
        navigation.navigate('PendingApproval');
      }, 2000);
    } catch (error) {
      console.error('Erro no cadastro:', error);
      setError('Erro ao processar cadastro. Tente novamente.');
      setLoading(false);
    }
  };

  const renderStepIndicator = () => {
    return (
      <View style={styles.stepIndicator}>
        {[1, 2, 3, 4].map((step) => (
          <View key={step} style={styles.stepContainer}>
            <View style={[
              styles.stepCircle,
              currentStep >= step ? styles.activeStep : styles.inactiveStep
            ]}>
              <Text style={[
                styles.stepText,
                currentStep >= step ? styles.activeStepText : styles.inactiveStepText
              ]}>
                {step}
              </Text>
            </View>
            <Text style={styles.stepLabel}>
              {step === 1 && 'Dados'}
              {step === 2 && 'Plano'}
              {step === 3 && 'Documentos'}
              {step === 4 && 'Pagamento'}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Cadastro ANETI</Text>
        <Text style={styles.subtitle}>Junte-se à nossa comunidade de profissionais</Text>

        {renderStepIndicator()}

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Etapa 1: Informações básicas */}
        {currentStep === 1 && (
          <RegisterForm 
            formData={formData}
            onFormChange={handleFormDataChange}
          />
        )}

        {/* Etapa 2: Seleção de plano */}
        {currentStep === 2 && (
          <PlanSelection
            plans={plans}
            selectedPlan={formData.selectedPlan}
            onSelectPlan={handlePlanSelect}
          />
        )}

        {/* Etapa 3: Upload de documentos */}
        {currentStep === 3 && (
          <DocumentUpload
            selectedPlan={formData.selectedPlan}
            onDocumentUpload={handleDocumentUpload}
            linkedinProfile={formData.linkedinProfile}
            onLinkedinChange={(value) => handleFormDataChange({ linkedinProfile: value })}
          />
        )}

        {/* Etapa 4: Pagamento (apenas para planos pagos) */}
        {currentStep === 4 && (
          <View style={styles.finalStep}>
            {formData.selectedPlan && formData.selectedPlan !== 'public' ? (
              <PaymentForm
                onSubmit={handlePaymentSubmit}
                planPrice={plans.find(p => p.id === formData.selectedPlan)?.price || 0}
              />
            ) : (
              <View style={styles.freeConfirmation}>
                <Text style={styles.confirmationTitle}>Confirmar cadastro</Text>
                <Text style={styles.confirmationText}>Você selecionou o plano Público, que é gratuito.</Text>
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  <Text style={styles.submitButtonText}>
                    {loading ? 'Processando...' : 'Finalizar cadastro'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Botões de navegação */}
        {currentStep < 4 && (
          <View style={styles.navigationButtons}>
            {currentStep > 1 && (
              <TouchableOpacity
                style={styles.backButton}
                onPress={handlePrevStep}
              >
                <Text style={styles.backButtonText}>Voltar</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.nextButton, currentStep > 1 && { marginLeft: 'auto' }]}
              onPress={handleNextStep}
            >
              <Text style={styles.nextButtonText}>Próximo</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.loginLinkText}>
            Já tem uma conta? Faça login
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  stepContainer: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeStep: {
    backgroundColor: '#003366',
  },
  inactiveStep: {
    backgroundColor: '#ccc',
  },
  stepText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  activeStepText: {
    color: '#fff',
  },
  inactiveStepText: {
    color: '#666',
  },
  stepLabel: {
    fontSize: 12,
    marginTop: 5,
    color: '#666',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
  },
  navigationButtons: {
    flexDirection: 'row',
    marginTop: 30,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  backButtonText: {
    color: '#666',
    fontSize: 16,
  },
  nextButton: {
    backgroundColor: '#003366',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  finalStep: {
    marginTop: 20,
  },
  freeConfirmation: {
    alignItems: 'center',
    padding: 20,
  },
  confirmationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  confirmationText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#003366',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  loginLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  loginLinkText: {
    color: '#003366',
    fontSize: 14,
  },
});

export default RegisterPage;
