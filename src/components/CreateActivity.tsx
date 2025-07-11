import React, { useState } from 'react';
import { User, Activity, Question, FileAttachment } from '../types';
import { saveActivity } from '../storage';
import { ArrowLeft, Plus, X, Upload, FileText, CheckCircle } from 'lucide-react';
import { fileToBase64, validateFileSize, formatFileSize } from '../utils';

interface CreateActivityProps {
  user: User;
  onBack: () => void;
}

const CreateActivity: React.FC<CreateActivityProps> = ({ user, onBack }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const addQuestion = (type: 'multiple-choice' | 'essay') => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type,
      question: '',
      options: type === 'multiple-choice' ? ['', '', '', ''] : undefined,
      correctAnswer: type === 'multiple-choice' ? 0 : undefined,
      points: 1
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const updateQuestionOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions];
    if (updated[questionIndex].options) {
      updated[questionIndex].options![optionIndex] = value;
    }
    setQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!validateFileSize(file)) {
        alert(`Arquivo ${file.name} é muito grande. Máximo 80MB permitido.`);
        continue;
      }

      try {
        const base64 = await fileToBase64(file);
        const fileAttachment: FileAttachment = {
          id: Date.now().toString() + i,
          name: file.name,
          size: file.size,
          type: file.type,
          data: base64,
          uploadedAt: new Date().toISOString(),
          uploadedBy: user.id
        };
        setAttachments(prev => [...prev, fileAttachment]);
      } catch (error) {
        alert(`Erro ao processar arquivo ${file.name}`);
      }
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(attachments.filter(a => a.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert('Título é obrigatório');
      return;
    }

    if (questions.length === 0) {
      alert('Adicione pelo menos uma questão');
      return;
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        alert(`Questão ${i + 1} está vazia`);
        return;
      }
      
      if (q.type === 'multiple-choice') {
        if (!q.options || q.options.some(opt => !opt.trim())) {
          alert(`Questão ${i + 1}: Todas as opções devem ser preenchidas`);
          return;
        }
      }
    }

    setLoading(true);

    try {
      const activity: Activity = {
        id: Date.now().toString(),
        title: title.trim(),
        description: description.trim(),
        questions,
        attachments,
        createdAt: new Date().toISOString(),
        createdBy: user.id
      };

      saveActivity(activity);
      setSuccess(true);
      
      setTimeout(() => {
        onBack();
      }, 2000);
    } catch (error) {
      alert('Erro ao criar atividade');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Atividade Criada!</h2>
          <p className="text-gray-600">Redirecionando para o painel...</p>
        </div>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold text-gray-900">Nova Atividade</h1>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informações Básicas</h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Título da Atividade *
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* File Attachments */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Arquivos Anexos</h3>
            
            <div className="mb-4">
              <label className="block">
                <span className="sr-only">Escolher arquivos</span>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </label>
              <p className="text-sm text-gray-500 mt-1">Máximo 80MB por arquivo</p>
            </div>

            {attachments.length > 0 && (
              <div className="space-y-2">
                {attachments.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(file.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Questions */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Questões</h3>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => addQuestion('multiple-choice')}
                  className="flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Múltipla Escolha
                </button>
                <button
                  type="button"
                  onClick={() => addQuestion('essay')}
                  className="flex items-center px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Dissertativa
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {questions.map((question, index) => (
                <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">
                      Questão {index + 1} - {question.type === 'multiple-choice' ? 'Múltipla Escolha' : 'Dissertativa'}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <label className="text-sm text-gray-600">
                        Pontos:
                        <input
                          type="number"
                          min="1"
                          value={question.points}
                          onChange={(e) => updateQuestion(index, 'points', parseInt(e.target.value))}
                          className="ml-2 w-16 px-2 py-1 border border-gray-300 rounded"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => removeQuestion(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Enunciado da Questão
                      </label>
                      <textarea
                        value={question.question}
                        onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    {question.type === 'multiple-choice' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Opções (marque a correta)
                        </label>
                        <div className="space-y-2">
                          {question.options?.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center space-x-2">
                              <input
                                type="radio"
                                name={`correct-${question.id}`}
                                checked={question.correctAnswer === optionIndex}
                                onChange={() => updateQuestion(index, 'correctAnswer', optionIndex)}
                                className="text-blue-600"
                              />
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => updateQuestionOption(index, optionIndex, e.target.value)}
                                placeholder={`Opção ${optionIndex + 1}`}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Criando...' : 'Criar Atividade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateActivity;