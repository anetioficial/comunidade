import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Replace with your actual backend URL
const API_URL = 'http://localhost:3000'; // Or your deployed backend URL

const FeedPage: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('userToken');
        if (!token) {
          setError('Token não encontrado. Faça login novamente.');
          navigate('/login');
          return;
        }
        const response = await axios.get(`${API_URL}/api/posts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPosts(response.data);
      } catch (error: any) {
        console.error("Fetch posts error:", error.response?.data || error.message);
        setError('Não foi possível carregar as publicações.');
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem('userToken');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [navigate]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) {
      setError('O conteúdo da publicação não pode estar vazio.');
      return;
    }
    setPosting(true);
    setError('');
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        setError('Token não encontrado.');
        setPosting(false);
        navigate('/login');
        return;
      }
      const response = await axios.post(
        `${API_URL}/api/posts`,
        { content: newPostContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Add the new post to the top of the list
      setPosts([response.data.post, ...posts]);
      setNewPostContent(''); // Clear input field
      alert('Publicação criada com sucesso!');
    } catch (error: any) {
      console.error("Create post error:", error.response?.data || error.message);
      setError('Não foi possível criar a publicação.');
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('userToken');
        navigate('/login');
      }
    } finally {
      setPosting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Feed de Publicações</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => navigate('/profile')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
            >
              Perfil
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Create Post Form */}
        <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Criar Nova Publicação</h2>
          <form onSubmit={handleCreatePost}>
            <div>
              <textarea
                rows={3}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                placeholder="O que você está pensando?"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
              ></textarea>
            </div>
            {error && (
              <div className="mt-2 text-red-500 text-sm">{error}</div>
            )}
            <div className="mt-3 text-right">
              <button
                type="submit"
                disabled={posting || !newPostContent.trim()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {posting ? 'Publicando...' : 'Publicar'}
              </button>
            </div>
          </form>
        </div>

        {/* Posts List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Carregando publicações...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">Nenhuma publicação encontrada.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {posts.map((post) => (
                <li key={post.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-indigo-600 truncate">
                      {post.user_name || 'Usuário'}
                    </p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {new Date(post.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="text-sm text-gray-900">
                        {post.content}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
};

export default FeedPage;
