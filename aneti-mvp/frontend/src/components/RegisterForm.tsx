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

interface RegisterFormProps {
  formData: {
    name: string;
    email: string;
    confirmEmail: string;
    password: string;
    confirmPassword: string;
  };
  onFormChange: (data: any) => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ formData, onFormChange }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (field: string, value: string) => {
    onFormChange({ ...formData, [field]: value });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Informações da conta</Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>
          Nome completo <Text style={styles.requiredMark}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Digite seu nome completo"
          value={formData.name}
          onChangeText={(value) => handleChange('name', value)}
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>
          E-mail <Text style={styles.requiredMark}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Digite seu e-mail"
          value={formData.email}
          onChangeText={(value) => handleChange('email', value)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>
          Confirme o e-mail <Text style={styles.requiredMark}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Digite seu e-mail novamente"
          value={formData.confirmEmail}
          onChangeText={(value) => handleChange('confirmEmail', value)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>
          Senha <Text style={styles.requiredMark}>*</Text>
        </Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Digite sua senha"
            value={formData.password}
            onChangeText={(value) => handleChange('password', value)}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons 
              name={showPassword ? "eye-off-outline" : "eye-outline"} 
              size={24} 
              color="#003366" 
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.helperText}>
          A senha deve ter pelo menos 12 caracteres, incluindo letras maiúsculas, minúsculas, números e símbolos.
        </Text>
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>
          Confirme a senha <Text style={styles.requiredMark}>*</Text>
        </Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Digite sua senha novamente"
            value={formData.confirmPassword}
            onChangeText={(value) => handleChange('confirmPassword', value)}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Ionicons 
              name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
              size={24} 
              color="#003366" 
            />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  requiredMark: {
    color: 'red',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 10,
  },
  helperText: {
    marginTop: 5,
    fontSize: 12,
    color: '#888',
  },
});

export default RegisterForm;
