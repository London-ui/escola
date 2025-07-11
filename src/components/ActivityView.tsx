import React, { useState, useEffect } from 'react';
import { Activity, User, Submission, Student } from '../types';
import { getSubmissions, getStudents } from '../storage';
import { ArrowLeft, Users, CheckCircle, Clock, FileText, Download, Eye } from 'lucide-react';
import { formatDate, formatFileSize, downloadFile } from '../utils';

interface ActivityViewProps {
  activity: Activity;
  user: User;
  onBack: () => void;
}

const ActivityView: React.FC<ActivityViewProps> = ({ activity, user, onBack }) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allSubmissions = getSubmissions();
    const activitySubmissions = allSubmissions.filter(s => s.activityId === activity.id);
    setSubmissions(activitySubmissions);
    setStudents(getStudents());
  };

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.name : 'Aluno não encontrado';
  };

  const getStudentId = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.studentId : 'N/A';
  };

  const getStats = () => {
    const totalStudents = students.length;
    const submitted = submissions.length;
    const pending = totalStudents - submitted;
    const averageGrade = submissions.length > 0 
      ? submissions.reduce((sum, s) => sum + s.grade, 0) / submissions.length 
      : 0;
    
    return { totalStudents, submitted, pending, averageGrade };
  };

  const handleViewSubmission = (submission: Submission) => {
    setSelectedSubmission(submission);
    setShowDetails(true);
  };

  const stats = getStats();

  if (showDetails && selectedSubmission) {
    const studentName = getStudentName(selectedSubmission.studentId);
    const studentId = getStudentId(selectedSubmission.studentId);
    
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center py-4">
              <button
                onClick={() => setShowDetails(false)}
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Voltar
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                Submissão de {studentName}
              </h1>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Student Info */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{studentName}</h3>
                <p className="text-sm text-gray-600">ID: {studentId}</p>
                <p className="text-sm text-gray-600">Enviado em: {formatDate(selectedSubmission.submittedAt)}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">{selectedSubmission.grade}%</div>
                <div className="text-sm text-gray-600">
                  {selectedSubmission.totalPoints}/{selectedSubmission.maxPoints} pontos
                </div>
              </div>
            </div>
          </div>

          {/* Answers */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Respostas</h3>
            <div className="space-y-6">
              {activity.questions.map((question, index) => {
                const answer = selectedSubmission.answers.find(a => a.questionId === question.id);
                return (
                  <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-medium text-gray-900">
                        Questão {index + 1} ({question.points} pontos)
                      </h4>
                      <div className="flex items-center">
                        {answer?.isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        ) : question.type === 'multiple-choice' ? (
                          <div className="h-5 w-5 bg-red-500 rounded-full mr-2" />
                        ) : (
                          <div className="h-5 w-5 bg-yellow-500 rounded-full mr-2" />
                        )}
                        <span className="text-sm font-medium">
                          {answer?.points}/{question.points} pontos
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-3">{question.question}</p>
                    
                    {question.type === 'multiple-choice' && (
                      <div className="space-y-2">
                        {question.options?.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className={`p-2 rounded ${
                              optionIndex === question.correctAnswer
                                ? 'bg-green-100 border-green-300'
                                : optionIndex === answer?.answer
                                ? 'bg-red-100 border-red-300'
                                : 'bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center">
                              <span className="text-sm font-medium mr-2">
                                {String.fromCharCode(65 + optionIndex)})
                              </span>
                              <span className="text-sm">{option}</span>
                              {optionIndex === question.correctAnswer && (
                                <CheckCircle className="h-4 w-4 text-green-500 ml-2" />
                              )}
                              {optionIndex === answer?.answer && optionIndex !== question.correctAnswer && (
                                <span className="text-xs text-red-600 ml-2">(Resposta do aluno)</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {question.type === 'essay' && (
                      <div className="mt-3">
                        <div className="bg-gray-50 p-3 rounded">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{answer?.answer}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Student Files */}
          {selectedSubmission.attachments.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Arquivos Enviados</h3>
              <div className="space-y-2">
                {selectedSubmission.attachments.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => downloadFile(file.data, file.name)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Baixar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
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
            <h1 className="text-2xl font-bold text-gray-900">{activity.title}</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total de Alunos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Entregaram</p>
                <p className="text-2xl font-bold text-gray-900">{stats.submitted}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-purple-600 font-bold">%</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Média</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageGrade.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Informações da Atividade</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600">Descrição</p>
              <p className="text-gray-900">{activity.description || 'Sem descrição'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Criada em</p>
              <p className="text-gray-900">{formatDate(activity.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Questões</p>
              <p className="text-gray-900">{activity.questions.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Pontos Totais</p>
              <p className="text-gray-900">{activity.questions.reduce((sum, q) => sum + q.points, 0)}</p>
            </div>
          </div>
        </div>

        {/* Submissions List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Submissões</h3>
          </div>
          
          {submissions.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma submissão ainda</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aluno
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nota
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pontos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Enviado em
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {submissions.map((submission) => (
                    <tr key={submission.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-700">
                                {getStudentName(submission.studentId).charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {getStudentName(submission.studentId)}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {getStudentId(submission.studentId)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">{submission.grade}%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {submission.totalPoints}/{submission.maxPoints}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(submission.submittedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => handleViewSubmission(submission)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Ver Detalhes
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityView;