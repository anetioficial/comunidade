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

interface PaymentFormProps {
  onSubmit: (values: any) => void;
  planPrice: number;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ onSubmit, planPrice }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [finalPrice, setFinalPrice] = useState(planPrice);

  const handleApplyDiscount = () => {
    if (discountCode && !discountApplied) {
      // Simulação de aplicação de desconto
      const discount = 0.1; // 10%
      setFinalPrice(planPrice * (1 - discount));
      setDiscountApplied(true);
    }
  };

  const handleSubmit = () => {
    // Validação básica
    if (!cardNumber || !expiryDate || !cvv) {
      alert('Por favor, preencha todos os campos do cartão');
      return;
    }

    onSubmit({
      cardNumber,
      expiryDate,
      cvv,
      discountCode: discountApplied ? discountCode : null,
      finalPrice
    });
  };

  // Formatação do número do cartão (4 dígitos por grupo)
  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted.substring(0, 19); // Limita a 16 dígitos + 3 espaços
  };

  // Formatação da data de validade (MM/AA)
  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 3) {
      return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
    }
    return cleaned;
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Informações de pagamento</Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Número do cartão</Text>
        <TextInput
          style={styles.input}
          placeholder="1234 5678 9012 3456"
          value={cardNumber}
          onChangeText={(text) => setCardNumber(formatCardNumber(text))}
          keyboardType="numeric"
        />
      </View>
      
      <View style={styles.row}>
        <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
          <Text style={styles.label}>Data de validade</Text>
          <TextInput
            style={styles.input}
            placeholder="MM/AA"
            value={expiryDate}
            onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
            keyboardType="numeric"
            maxLength={5}
          />
        </View>
        
        <View style={[styles.formGroup, { flex: 1 }]}>
          <Text style={styles.label}>CVV</Text>
          <TextInput
            style={styles.input}
            placeholder="123"
            value={cvv}
            onChangeText={setCvv}
            keyboardType="numeric"
            maxLength={4}
          />
        </View>
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Código de desconto</Text>
        <View style={styles.discountContainer}>
          <TextInput
            style={[styles.discountInput, discountApplied && styles.disabledInput]}
            placeholder="Digite seu código"
            value={discountCode}
            onChangeText={setDiscountCode}
            editable={!discountApplied}
          />
          <TouchableOpacity
            style={[
              styles.discountButton,
              (!discountCode || discountApplied) && styles.disabledButton
            ]}
            onPress={handleApplyDiscount}
            disabled={!discountCode || discountApplied}
          >
            <Text style={styles.discountButtonText}>Aplicar</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total:</Text>
        <Text style={styles.totalPrice}>R${finalPrice.toFixed(2)}</Text>
        {discountApplied && (
          <Text style={styles.discountAppliedText}>(Desconto aplicado)</Text>
        )}
      </View>
      
      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
      >
        <Text style={styles.submitButtonText}>Finalizar pagamento</Text>
      </TouchableOpacity>
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
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  discountContainer: {
    flexDirection: 'row',
  },
  discountInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    padding: 12,
    fontSize: 16,
  },
  disabledInput: {
    backgroundColor: '#f0f0f0',
    color: '#888',
  },
  discountButton: {
    backgroundColor: '#003366',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
  },
  disabledButton: {
    backgroundColor: '#9ab',
  },
  discountButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  totalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 5,
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#003366',
  },
  discountAppliedText: {
    fontSize: 14,
    color: 'green',
    marginLeft: 10,
  },
  submitButton: {
    backgroundColor: '#003366',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default PaymentForm;
