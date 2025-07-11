import React, { useState } from 'react';
import { User, Student } from '../types';
import { getUsers, getStudents, setCurrentUser } from '../storage';
import { LogIn, User as UserIcon, GraduationCap } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [userType, setUserType] = useState<'teacher' | 'student'>('student');
  const [credentials, setCredentials] = useState({ id: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (userType === 'teacher') {
        const users = getUsers();
        const teacher = users.find(u => u.type === 'teacher' && u.password === credentials.password);
        
        if (teacher) {
          setCurrentUser(teacher);
          onLogin(teacher);
        } else {
          setError('Senha incorreta');
        }
      } else {
        const students = getStudents();
        const student = students.find(s => s.studentId === credentials.id && s.password === credentials.password);
        
        if (student) {
          const userStudent: User = {
            id: student.id,
            type: 'student',
            name: student.name,
            studentId: student.studentId,
            password: student.password
          };
          setCurrentUser(userStudent);
          onLogin(userStudent);
        } else {
          setError('ID ou senha incorretos');
        }
      }
    } catch (err) {
      setError('Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <GraduationCap className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Sistema de Atividades</h1>
          <p className="text-gray-600">Faça login para continuar</p>
        </div>

        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setUserType('student')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              userType === 'student'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <UserIcon className="h-4 w-4 inline mr-2" />
            Aluno
          </button>
          <button
            type="button"
            onClick={() => setUserType('teacher')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              userType === 'teacher'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            <GraduationCap className="h-4 w-4 inline mr-2" />
            Professor
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="id" className="block text-sm font-medium text-gray-700 mb-1">
              {userType === 'teacher' ? 'Login' : 'ID do Aluno'}
            </label>
            <input
              type="text"
              id="id"
              value={credentials.id}
              onChange={(e) => setCredentials({ ...credentials, id: e.target.value })}
              placeholder={userType === 'teacher' ? 'Digite seu login' : 'Digite seu ID (3 dígitos)'}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={userType === 'teacher'}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <input
              type="password"
              id="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              placeholder="Digite sua senha"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Entrando...
              </div>
            ) : (
              <>
                <LogIn className="h-4 w-4 inline mr-2" />
                Entrar
              </>
            )}
          </button>
        </form>

        {userType === 'student' && (
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Não tem uma conta? Procure seu professor para criar uma conta.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;