import React, { useState, useEffect } from 'react';
import { User, Student } from '../types';
import { getStudents, saveStudent, generateStudentId } from '../storage';
import { ArrowLeft, Plus, Users, Edit3, Eye, EyeOff } from 'lucide-react';
import { formatDate } from '../utils';

interface StudentManagementProps {
  user: User;
  onBack: () => void;
}

const StudentManagement: React.FC<StudentManagementProps> = ({ user, onBack }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = () => {
    setStudents(getStudents());
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newStudentName.trim()) {
      alert('Nome é obrigatório');
      return;
    }

    setLoading(true);

    try {
      const studentId = generateStudentId();
      const newStudent: Student = {
        id: Date.now().toString(),
        name: newStudentName.trim(),
        studentId,
        password: '123',
        createdAt: new Date().toISOString()
      };

      saveStudent(newStudent);
      setNewStudentName('');
      setShowAddForm(false);
      loadStudents();
      
      alert(`Aluno criado com sucesso!\nID: ${studentId}\nSenha: 123`);
    } catch (error) {
      alert('Erro ao criar aluno');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (studentId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Voltar
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Gerenciar Alunos</h1>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Student Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Adicionar Novo Aluno</h3>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Aluno
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleAddStudent} className="flex items-end space-x-4">
              <div className="flex-1">
                <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Aluno
                </label>
                <input
                  type="text"
                  id="studentName"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Digite o nome do aluno"
                  required
                />
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Criando...' : 'Criar'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewStudentName('');
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Students List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Lista de Alunos</h3>
              <div className="flex items-center text-sm text-gray-500">
                <Users className="h-4 w-4 mr-1" />
                {students.length} {students.length === 1 ? 'aluno' : 'alunos'}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {students.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum aluno cadastrado ainda</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="mt-4 text-blue-600 hover:text-blue-800"
                >
                  Adicionar primeiro aluno
                </button>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID do Aluno
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Senha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Criado em
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-700">
                                {student.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded">
                          {student.studentId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded mr-2">
                            {showPasswords[student.id] ? student.password : '•••'}
                          </span>
                          <button
                            onClick={() => togglePasswordVisibility(student.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {showPasswords[student.id] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(student.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              const info = `Nome: ${student.name}\nID: ${student.studentId}\nSenha: ${student.password}`;
                              alert(info);
                            }}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Ver Detalhes
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Informações Importantes:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Cada aluno recebe um ID único de 3 dígitos</li>
            <li>• A senha padrão para todos os alunos é "123"</li>
            <li>• Os alunos usam o ID e senha para fazer login no sistema</li>
            <li>• Você pode visualizar as senhas clicando no ícone do olho</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StudentManagement;