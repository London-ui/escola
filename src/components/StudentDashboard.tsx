import React, { useState, useEffect } from 'react';
import { User, Activity, Submission } from '../types';
import { getActivities, getSubmissions, logout } from '../storage';
import { FileText, Clock, CheckCircle, LogOut, BookOpen } from 'lucide-react';
import ActivityStudent from './ActivityStudent';
import { formatDate } from '../utils';

interface StudentDashboardProps {
  user: User;
  onLogout: () => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, onLogout }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'activity'>('dashboard');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setActivities(getActivities());
    setSubmissions(getSubmissions());
  };

  const handleLogout = () => {
    logout();
    onLogout();
  };

  const handleActivityClick = (activity: Activity) => {
    setSelectedActivity(activity);
    setCurrentView('activity');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedActivity(null);
    loadData();
  };

  const getActivityStatus = (activityId: string) => {
    const submission = submissions.find(s => s.activityId === activityId && s.studentId === user.id);
    return submission ? 'completed' : 'pending';
  };

  const getActivityGrade = (activityId: string) => {
    const submission = submissions.find(s => s.activityId === activityId && s.studentId === user.id);
    return submission ? submission.grade : null;
  };

  if (currentView === 'activity' && selectedActivity) {
    return (
      <ActivityStudent
        activity={selectedActivity}
        user={user}
        onBack={handleBackToDashboard}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Painel do Aluno</h1>
              <p className="text-sm text-gray-600">Bem-vindo, {user.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{user.studentId}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total de Atividades</dt>
                  <dd className="text-2xl font-bold text-gray-900">{activities.length}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Concluídas</dt>
                  <dd className="text-2xl font-bold text-gray-900">
                    {activities.filter(a => getActivityStatus(a.id) === 'completed').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pendentes</dt>
                  <dd className="text-2xl font-bold text-gray-900">
                    {activities.filter(a => getActivityStatus(a.id) === 'pending').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Activities List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Suas Atividades</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {activities.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma atividade disponível ainda</p>
              </div>
            ) : (
              activities.map((activity) => {
                const status = getActivityStatus(activity.id);
                const grade = getActivityGrade(activity.id);
                const maxPoints = activity.questions.reduce((sum, q) => sum + q.points, 0);
                
                return (
                  <div
                    key={activity.id}
                    className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleActivityClick(activity)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h4 className="text-lg font-medium text-gray-900">{activity.title}</h4>
                          <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${
                            status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {status === 'completed' ? 'Concluída' : 'Pendente'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                        <div className="flex items-center mt-2 text-sm text-gray-500">
                          <span>Criada em {formatDate(activity.createdAt)}</span>
                          <span className="mx-2">•</span>
                          <span>{activity.questions.length} questões</span>
                          <span className="mx-2">•</span>
                          <span>{maxPoints} pontos</span>
                          {activity.attachments.length > 0 && (
                            <>
                              <span className="mx-2">•</span>
                              <span>{activity.attachments.length} arquivos</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        {status === 'completed' && grade !== null && (
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">{grade}%</div>
                            <div className="text-sm text-gray-500">Nota</div>
                          </div>
                        )}
                        <div className="text-right">
                          <button className="text-blue-600 hover:text-blue-800 font-medium">
                            {status === 'completed' ? 'Ver Resultado' : 'Iniciar'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;