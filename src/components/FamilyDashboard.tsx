import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Family, Media, Post, Notification } from '../types';
import { 
  getFamily, 
  getFamilyMedia, 
  getFamilyPosts, 
  getFamilyNotifications,
  subscribeToFamilyPosts,
  subscribeToFamilyNotifications
} from '../lib/firestore';
import Layout from './Layout';
import NotificationPanel from './NotificationPanel';
import ProfileViewer from './ProfileViewer';
import Settings from './Settings';
import CreatePost from './CreatePost';
import BibleQuiz from './BibleQuiz';
import AdminDashboard from './AdminDashboard';
import { 
  Image, 
  Music, 
  MessageSquare, 
  Bell, 
  Calendar,
  Users,
  Download,
  Heart,
  MessageCircle,
  Camera,
  Headphones,
  Plus,
  Trophy,
  Gamepad2
} from 'lucide-react';

export default function FamilyDashboard() {
  const { userData } = useAuth();
  const { isDarkMode } = useTheme();
  
  const [family, setFamily] = useState<Family | null>(null);
  const [recentMedia, setRecentMedia] = useState<Media[]>([]);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<'photos' | 'audio' | 'community'>('photos');
  const [loading, setLoading] = useState(true);
  
  // Panel states
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showBibleQuiz, setShowBibleQuiz] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);

  useEffect(() => {
    const loadFamilyData = async () => {
      if (!userData?.familyId) return;
      
      try {
        setLoading(true);
        
        // Load family data
        const familyData = await getFamily(userData.familyId);
        setFamily(familyData);
        
        // Load media
        const mediaData = await getFamilyMedia(userData.familyId);
        setRecentMedia(mediaData);
        
        // Load posts
        const postsData = await getFamilyPosts(userData.familyId);
        setRecentPosts(postsData);
        
        // Load notifications
        const notificationsData = await getFamilyNotifications(userData.familyId);
        setNotifications(notificationsData);
        
      } catch (error) {
        console.error('Error loading family data:', error);
        // Set empty arrays to prevent undefined errors
        setRecentMedia([]);
        setRecentPosts([]);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    loadFamilyData();
    
    // Set up real-time listeners
    let unsubscribePosts: (() => void) | undefined;
    let unsubscribeNotifications: (() => void) | undefined;
    
    if (userData?.familyId) {
      try {
        unsubscribePosts = subscribeToFamilyPosts(userData.familyId, setRecentPosts);
        unsubscribeNotifications = subscribeToFamilyNotifications(userData.familyId, setNotifications);
      } catch (error) {
        console.error('Error setting up real-time listeners:', error);
      }
    }
    
    return () => {
      try {
        if (unsubscribePosts) unsubscribePosts();
        if (unsubscribeNotifications) unsubscribeNotifications();
      } catch (error) {
        console.error('Error cleaning up listeners:', error);
      }
    };
  }, [userData?.familyId]);

  const handlePostCreated = () => {
    // Refresh posts when a new post is created
    if (userData?.familyId) {
      getFamilyPosts(userData.familyId).then(setRecentPosts);
    }
  };

  const handleNotificationRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, isRead: true }
          : notif
      )
    );
  };

  const unreadNotifications = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <Layout 
        title="Loading..."
        onNotificationClick={() => setShowNotifications(true)}
        onProfileClick={() => setShowProfile(true)}
        onSettingsClick={() => setShowSettings(true)}
        notificationCount={unreadNotifications}
      >
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </Layout>
    );
  }

  const photos = recentMedia.filter(media => media.type === 'photo');
  const audio = recentMedia.filter(media => media.type === 'audio');

  return (
    <>
      <Layout 
        title={`${family?.name} Family Dashboard`}
        onNotificationClick={() => setShowNotifications(true)}
        onProfileClick={() => setShowProfile(true)}
        onSettingsClick={() => setShowSettings(true)}
        notificationCount={unreadNotifications}
      >
      <div className="space-y-8">
        {/* Family Header */}
        <div className="rounded-3xl shadow-lg p-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome to {family?.name}</h1>
              <p className="text-white/90 text-lg">{family?.description}</p>
              <div className="flex items-center space-x-6 mt-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>
                    {family?.memberCount && family.memberCount > 0 
                      ? `${family.memberCount} member${family.memberCount !== 1 ? 's' : ''}`
                      : 'No members yet'
                    }
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Active community</span>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="flex space-x-4">
                {userData?.role === 'admin' && (
                  <button
                    onClick={() => setShowAdminDashboard(true)}
                    className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center hover:bg-white/30 transition-colors"
                    title="Admin Dashboard"
                  >
                    <Shield className="w-8 h-8 text-white" />
                  </button>
                )}
                <button
                  onClick={() => setShowBibleQuiz(true)}
                  className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center hover:bg-white/30 transition-colors"
                  title="Bible Quiz"
                >
                  <Trophy className="w-8 h-8 text-white" />
                </button>
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Image className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {photos.length}
                </h3>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  Recent Photos
                </p>
              </div>
            </div>
          </div>
          
          <div className={`rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Music className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {audio.length}
                </h3>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  Audio Files
                </p>
              </div>
            </div>
          </div>
          
          <div className={`rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className={`text-lg font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {recentPosts.length}
                </h3>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  Recent Posts
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className={`rounded-3xl shadow-lg overflow-hidden ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          {/* Tab Headers */}
          <div className={`border-b ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <nav className="flex space-x-8 px-8 py-4">
              <button
                onClick={() => setActiveTab('photos')}
                className={`flex items-center space-x-2 py-2 px-4 rounded-lg transition-colors ${
                  activeTab === 'photos'
                    ? 'bg-blue-100 text-blue-700'
                    : isDarkMode 
                      ? 'text-gray-400 hover:text-gray-300'
                      : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>Photos</span>
              </button>
              <button
                onClick={() => setActiveTab('audio')}
                className={`flex items-center space-x-2 py-2 px-4 rounded-lg transition-colors ${
                  activeTab === 'audio'
                    ? 'bg-green-100 text-green-700'
                    : isDarkMode 
                      ? 'text-gray-400 hover:text-gray-300'
                      : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Headphones className="w-4 h-4" />
                <span>Audio</span>
              </button>
              <button
                onClick={() => setActiveTab('community')}
                className={`flex items-center space-x-2 py-2 px-4 rounded-lg transition-colors ${
                  activeTab === 'community'
                    ? 'bg-purple-100 text-purple-700'
                    : isDarkMode 
                      ? 'text-gray-400 hover:text-gray-300'
                      : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Community</span>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'photos' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className={`text-2xl font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Recent Photos
                  </h2>
                  <button className="text-blue-600 hover:text-blue-700 font-medium">
                    View All Photos
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {photos.map((photo) => (
                    <div key={photo.id} className="bg-gray-100 rounded-2xl aspect-square relative overflow-hidden group">
                      <div className={`w-full h-full bg-gradient-to-br flex items-center justify-center ${
                        isDarkMode 
                          ? 'from-gray-700 to-gray-600' 
                          : 'from-purple-100 to-blue-100'
                      }`}>
                        <Image className="w-16 h-16 text-purple-400" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <h3 className="font-semibold mb-1">{photo.title}</h3>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white/90">Click to view</span>
                          <Download className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  ))}
                  {photos.length === 0 && (
                    <div className="col-span-full text-center py-12">
                      <Image className={`w-16 h-16 mx-auto mb-4 ${
                        isDarkMode ? 'text-gray-600' : 'text-gray-400'
                      }`} />
                      <p className={isDarkMode ? 'text-gray-500' : 'text-gray-500'}>
                        No photos available yet
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'audio' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className={`text-2xl font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Recent Audio
                  </h2>
                  <button className="text-green-600 hover:text-green-700 font-medium">
                    View All Audio
                  </button>
                </div>
                <div className="space-y-4">
                  {audio.map((audioFile) => (
                    <div key={audioFile.id} className={`rounded-2xl p-6 transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 hover:bg-gray-600' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <Music className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <h3 className={`font-semibold ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {audioFile.title}
                            </h3>
                            <p className={`text-sm ${
                              isDarkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {audioFile.description || 'No description'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className={`p-2 text-green-600 rounded-lg transition-colors ${
                            isDarkMode ? 'hover:bg-green-900/20' : 'hover:bg-green-100'
                          }`}>
                            <Music className="w-4 h-4" />
                          </button>
                          <button className={`p-2 rounded-lg transition-colors ${
                            isDarkMode 
                              ? 'text-gray-400 hover:bg-gray-600' 
                              : 'text-gray-600 hover:bg-gray-200'
                          }`}>
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {audio.length === 0 && (
                    <div className="text-center py-12">
                      <Music className={`w-16 h-16 mx-auto mb-4 ${
                        isDarkMode ? 'text-gray-600' : 'text-gray-400'
                      }`} />
                      <p className={isDarkMode ? 'text-gray-500' : 'text-gray-500'}>
                        No audio files available yet
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'community' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className={`text-2xl font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Community Feed
                  </h2>
                  <button 
                    onClick={() => setShowCreatePost(true)}
                    className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Post</span>
                  </button>
                </div>
                <div className="space-y-6">
                  {recentPosts.map((post) => (
                    <div key={post.id} className={`rounded-2xl p-6 ${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                    }`}>
                      <div className="flex items-start space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isDarkMode ? 'bg-purple-900/20' : 'bg-purple-100'
                        }`}>
                          <span className={`font-medium ${
                            isDarkMode ? 'text-purple-400' : 'text-purple-600'
                          }`}>
                            {post.authorName.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`font-medium ${
                              isDarkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {post.authorName}
                            </span>
                            <span className={`text-sm ${
                              isDarkMode ? 'text-gray-500' : 'text-gray-500'
                            }`}>
                              •
                            </span>
                            <span className={`text-sm ${
                              isDarkMode ? 'text-gray-500' : 'text-gray-500'
                            }`}>
                              {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Recently'}
                            </span>
                            {post.type === 'announcement' && (
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                isDarkMode 
                                  ? 'bg-blue-900/20 text-blue-400' 
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                                Announcement
                              </span>
                            )}
                            {post.type === 'prayer-request' && (
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                isDarkMode 
                                  ? 'bg-red-900/20 text-red-400' 
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                Prayer Request
                              </span>
                            )}
                          </div>
                          <p className={`mb-4 ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-700'
                          }`}>
                            {post.content}
                          </p>
                          <div className={`flex items-center space-x-4 text-sm ${
                            isDarkMode ? 'text-gray-500' : 'text-gray-500'
                          }`}>
                            <button className="flex items-center space-x-1 hover:text-red-500">
                              <Heart className="w-4 h-4" />
                              <span>{post.likes?.length || 0}</span>
                            </button>
                            <button className="flex items-center space-x-1 hover:text-blue-500">
                              <MessageCircle className="w-4 h-4" />
                              <span>{post.comments?.length || 0}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {recentPosts.length === 0 && (
                    <div className="text-center py-12">
                      <MessageSquare className={`w-16 h-16 mx-auto mb-4 ${
                        isDarkMode ? 'text-gray-600' : 'text-gray-400'
                      }`} />
                      <p className={isDarkMode ? 'text-gray-500' : 'text-gray-500'}>
                        No posts available yet
                      </p>
                      <button 
                        onClick={() => setShowCreatePost(true)}
                        className="mt-4 text-purple-600 hover:text-purple-700 font-medium"
                      >
                        Create the first post
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className={`rounded-3xl shadow-lg p-8 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Recent Updates
              </h2>
              <Bell className={`w-6 h-6 ${
                isDarkMode ? 'text-purple-400' : 'text-purple-600'
              }`} />
            </div>
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div key={notification.id} className={`flex items-start space-x-4 p-4 rounded-xl ${
                  isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'
                }`}>
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <h3 className={`font-medium mb-1 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {notification.title}
                    </h3>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {notification.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Floating Action Buttons */}
        <div className="fixed bottom-6 right-6 flex flex-col space-y-3">
          {userData?.role === 'admin' && (
            <button
              onClick={() => setShowAdminDashboard(true)}
              className="w-14 h-14 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
              title="Admin Dashboard"
            >
              <Shield className="w-6 h-6" />
            </button>
          )}
          <button
            onClick={() => setShowBibleQuiz(true)}
            className="w-14 h-14 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
            title="Bible Quiz"
          >
            <Gamepad2 className="w-6 h-6" />
          </button>
          <button
            onClick={() => setShowCreatePost(true)}
            className="w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
            title="Create Post"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>
      </Layout>

      {/* Modals */}
      <NotificationPanel
        notifications={notifications}
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        onNotificationRead={handleNotificationRead}
      />
      
      <ProfileViewer
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
      />
      
      <Settings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
      
      <CreatePost
        isOpen={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        onPostCreated={handlePostCreated}
      />
      
      <BibleQuiz
        isOpen={showBibleQuiz}
        onClose={() => setShowBibleQuiz(false)}
      />
      
      <AdminDashboard
        isOpen={showAdminDashboard}
        onClose={() => setShowAdminDashboard(false)}
      />
    </>
  );
}