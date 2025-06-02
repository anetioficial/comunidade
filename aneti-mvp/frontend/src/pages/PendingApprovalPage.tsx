import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const PendingApprovalPage = () => {
  const navigation = useNavigation();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.iconContainer}>
        <Image 
          source={require('../assets/check-circle.png')} 
          style={styles.icon}
          // Fallback para quando a imagem não estiver disponível
          defaultSource={require('../assets/check-circle.png')}
        />
      </View>
      
      <Text style={styles.title}>Cadastro em análise</Text>
      
      <Text style={styles.description}>
        Seu cadastro está sendo analisado pela equipe da ANETI.
      </Text>
      
      <Text style={styles.subDescription}>
        Você será notificado por e-mail assim que seu cadastro for aprovado.
        Este processo geralmente leva até 48 horas úteis.
      </Text>
      
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Precisa de ajuda?</Text>
        <Text style={styles.infoText}>
          Se tiver alguma dúvida ou precisar atualizar informações, entre em contato conosco pelo e-mail: 
          <Text style={styles.emailLink}> suporte@aneti.org.br</Text>
        </Text>
      </View>
      
      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.loginButtonText}>
          Voltar para a página de login
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  iconContainer: {
    marginVertical: 30,
  },
  icon: {
    width: 80,
    height: 80,
    tintColor: '#003366',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 18,
    color: '#555',
    marginBottom: 16,
    textAlign: 'center',
  },
  subDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: '#e6f0ff',
    borderWidth: 1,
    borderColor: '#cce0ff',
    borderRadius: 8,
    padding: 16,
    width: '100%',
    marginBottom: 30,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#444',
  },
  emailLink: {
    color: '#003366',
    fontWeight: 'bold',
  },
  loginButton: {
    marginTop: 20,
  },
  loginButtonText: {
    color: '#003366',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});

export default PendingApprovalPage;
