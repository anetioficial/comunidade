import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity 
} from 'react-native';

interface Plan {
  id: string;
  name: string;
  price: number;
  isPublic: boolean;
  description: string;
}

interface PlanSelectionProps {
  plans: Plan[];
  selectedPlan: string | null;
  onSelectPlan: (planId: string) => void;
}

const PlanSelection: React.FC<PlanSelectionProps> = ({ plans, selectedPlan, onSelectPlan }) => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Selecione seu plano</Text>
      
      <View style={styles.plansContainer}>
        {plans.map((plan) => (
          <TouchableOpacity
            key={plan.id}
            style={[
              styles.planCard,
              selectedPlan === plan.id && styles.selectedPlanCard
            ]}
            onPress={() => onSelectPlan(plan.id)}
          >
            <View style={styles.planInfo}>
              <Text style={styles.planName}>{plan.name}</Text>
              <Text style={styles.planPrice}>
                {plan.isPublic ? 'Livre' : `R$${plan.price.toFixed(2)} por ano`}
              </Text>
              <Text style={styles.planDescription}>{plan.description}</Text>
            </View>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => onSelectPlan(plan.id)}
            >
              <Text style={styles.selectButtonText}>Selecionar</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
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
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  plansContainer: {
    marginBottom: 20,
  },
  planCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedPlanCard: {
    borderColor: '#003366',
    backgroundColor: '#f0f7ff',
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  planPrice: {
    fontSize: 16,
    color: '#555',
    marginTop: 4,
  },
  planDescription: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },
  selectButton: {
    backgroundColor: '#003366',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  selectButtonText: {
    color: 'white',
    fontWeight: '500',
  },
});

export default PlanSelection;
