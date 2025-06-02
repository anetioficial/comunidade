import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    pendingRegistrations: 0,
    approvedUsers: 0,
    rejectedRegistrations: 0,
    totalPlans: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);

  // Simulação de carregamento de dados
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    // Simulação de chamada à API
    setTimeout(() => {
      setStats({
        pendingRegistrations: 12,
        approvedUsers: 156,
        rejectedRegistrations: 8,
        totalPlans: 4
      });
      
      setRecentActivity([
        { 
          id: 1, 
          name: 'João Silva', 
          email: 'joao.silva@example.com', 
          action: 'Cadastro', 
          date: '02/06/2025 14:30',
          status: 'pending'
        },
        { 
          id: 2, 
          name: 'Maria Oliveira', 
          email: 'maria.oliveira@example.com', 
          action: 'Cadastro', 
          date: '01/06/2025 10:15',
          status: 'approved'
        },
        { 
          id: 3, 
          name: 'Carlos Santos', 
          email: 'carlos.santos@example.com', 
          action: 'Cadastro', 
          date: '31/05/2025 16:45',
          status: 'rejected'
        }
      ]);
      
      setLoading(false);
      setRefreshing(false);
    }, 1000);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#f0ad4e';
      case 'approved': return '#5cb85c';
      case 'rejected': return '#d9534f';
      default: return '#777';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'pending': return 'Pendente';
      case 'approved': return 'Aprovado';
      case 'rejected': return 'Rejeitado';
      default: return 'Desconhecido';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#003366" />
        <Text style={styles.loadingText}>Carregando dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.title}>Dashboard</Text>
      
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Cadastros Pendentes</Text>
          <Text style={[styles.statValue, { color: '#f0ad4e' }]}>{stats.pendingRegistrations}</Text>
          <TouchableOpacity style={styles.statLink}>
            <Text style={styles.statLinkText}>Ver todos →</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Usuários Aprovados</Text>
          <Text style={[styles.statValue, { color: '#5cb85c' }]}>{stats.approvedUsers}</Text>
          <TouchableOpacity style={styles.statLink}>
            <Text style={styles.statLinkText}>Ver todos →</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Cadastros Rejeitados</Text>
          <Text style={[styles.statValue, { color: '#d9534f' }]}>{stats.rejectedRegistrations}</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total de Planos</Text>
          <Text style={[styles.statValue, { color: '#5bc0de' }]}>{stats.totalPlans}</Text>
          <TouchableOpacity style={styles.statLink}>
            <Text style={styles.statLinkText}>Gerenciar →</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Atividade Recente</Text>
        
        {recentActivity.map((activity) => (
          <View key={activity.id} style={styles.activityItem}>
            <View style={styles.activityHeader}>
              <Text style={styles.activityName}>{activity.name}</Text>
              <View style={[
                styles.statusBadge, 
                { backgroundColor: getStatusColor(activity.status) }
              ]}>
                <Text style={styles.statusText}>{getStatusText(activity.status)}</Text>
              </View>
            </View>
            <Text style={styles.activityEmail}>{activity.email}</Text>
            <View style={styles.activityFooter}>
              <Text style={styles.activityAction}>{activity.action}</Text>
              <Text style={styles.activityDate}>{activity.date}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
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
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLink: {
    marginTop: 5,
  },
  statLinkText: {
    color: '#003366',
    fontSize: 14,
  },
  sectionContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
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
  activityItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 12,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  activityName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  activityEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  activityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  activityAction: {
    fontSize: 14,
    color: '#333',
  },
  activityDate: {
    fontSize: 14,
    color: '#888',
  },
});

export default AdminDashboard;
