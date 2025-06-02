import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Replace with your actual backend URL
const API_URL = 'http://localhost:3000'; // Or your deployed backend URL

const ProfilePage: React.FC = () => {
  const [userData, setUserData] = useState<any>(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('userToken');
        if (!token) {
          // Handle case where token is missing
          setError('Token de autenticação não encontrado.');
          navigate('/login');
          return;
        }

        const response = await axios.get(`${API_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(response.data);
        setName(response.data.name || '');
      } catch (error: any) {
        console.error("Fetch profile error:", error.response?.data || error.message);
        setError('Não foi possível carregar o perfil.');
        // Handle specific errors like 401/403 (invalid token) by navigating to Login
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem('userToken');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      setError('O nome não pode ficar vazio.');
      return;
    }
    setUpdating(true);
    setError('');
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        setError('Token de autenticação não encontrado.');
        setUpdating(false);
        navigate('/login');
        return;
      }

      const response = await axios.put(
        `${API_URL}/api/users/profile`,
        { name },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUserData(response.data.user);
      alert('Perfil atualizado com sucesso!');
    } catch (error: any) {
      console.error("Update profile error:", error.response?.data || error.message);
      setError('Não foi possível atualizar o perfil.');
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('userToken');
        navigate('/login');
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="ml-3">Carregando Perfil...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Perfil do Usuário</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Informações pessoais e configurações</p>
        </div>
        
        {error && (
          <div className="px-4 py-3 bg-red-50 text-red-500 text-sm">{error}</div>
        )}
        
        {userData && (
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{userData.email}</dd>
              </div>
              
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Nome</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <form onSubmit={handleUpdateProfile}>
                    <div className="flex">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                      <button
                        type="submit"
                        disabled={updating || name === userData.name}
                        className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                      >
                        {updating ? 'Salvando...' : 'Salvar'}
                      </button>
                    </div>
                  </form>
                </dd>
              </div>
              
              <div className="bg-gray-50 px-4 py-5 sm:px-6">
                <button
                  onClick={handleLogout}
                  className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Logout
                </button>
              </div>
            </dl>
          </div>
        )}
      </div>
      
      <div className="mt-4 text-center">
        <button
          onClick={() => navigate('/feed')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Voltar para o Feed
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
