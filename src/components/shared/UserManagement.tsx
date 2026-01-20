import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { User as UserType, StudentProfile } from '../../types';
import { X, Users, Plus, Trash2, Eye, UserPlus, AlertCircle, Filter, Search, User, GraduationCap, Shield } from 'lucide-react';

interface UserManagementProps {
  onClose: () => void;
}

interface NewUser {
  name: string;
  icNumber: string;
  role: 'student' | 'hep' | 'warden' | 'security';
  email: string;
  studentId?: string;
  class?: string;
}

interface UserListItem extends Omit<UserType, 'createdAt'> {
  createdAt: Date;
}

interface DatabaseUser {
  id: string;
  name: string;
  ic_number: string;
  email: string;
  role: 'student' | 'hep' | 'warden' | 'security' | 'admin';
  student_id?: string | null;
  class?: string | null;
  dormitory_block?: string | null;
  dormitory_room?: string | null;
  profile_completed?: boolean | null;
  profile?: StudentProfile | null;
  created_at: string;
}

const UserManagement: React.FC<UserManagementProps> = ({ onClose }) => {
  const { user } = useAuth();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  const [newUser, setNewUser] = useState<NewUser>({
    name: '',
    icNumber: '',
    role: 'student',
    email: '',
    studentId: '',
    class: '',
  });

  const [filters, setFilters] = useState({
    userType: 'all',
    accountStatus: 'all',
    studentCategory: 'all',
    searchTerm: ''
  });

  const [showFilters, setShowFilters] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedStudentView, setSelectedStudentView] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Load users from Supabase on mount
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading users:', error);
          setError('Ralat semasa memuatkan senarai pengguna');
          return;
        }

        if (data) {
          // Map database users to app format
          const mappedUsers = data.map((dbUser: DatabaseUser) => ({
            id: dbUser.id,
            name: dbUser.name,
            icNumber: dbUser.ic_number,
            email: dbUser.email,
            role: dbUser.role,
            studentId: dbUser.student_id || undefined,
            class: dbUser.class || undefined,
            dormitoryBlock: dbUser.dormitory_block || undefined,
            dormitoryRoom: dbUser.dormitory_room || undefined,
            profileCompleted: dbUser.profile_completed || false,
            profile: dbUser.profile || undefined,
            createdAt: new Date(dbUser.created_at),
          }));
          setUsers(mappedUsers);
        }
      } catch (error) {
        console.error('Error loading users:', error);
        setError('Ralat semasa memuatkan senarai pengguna');
      } finally {
        setIsLoadingUsers(false);
      }
    };

    loadUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!newUser.name.trim() || !newUser.icNumber.trim() || !newUser.email.trim()) {
      setError('Sila isi semua maklumat yang diperlukan');
      return;
    }

    // Check if IC number already exists
    if (users.some((u) => u.icNumber === newUser.icNumber)) {
      setError('ID Pengguna ini sudah wujud dalam sistem');
      return;
    }

    // Generate student ID for students
    let studentId = '';
    if (newUser.role === 'student') {
      const studentCount = users.filter((u) => u.role === 'student').length;
      studentId = `KV2024${String(studentCount + 1).padStart(3, '0')}`;
    }

    setIsSubmitting(true);

    try {
      // Check if IC number already exists in database
      const { data: existingUser } = await supabase
        .from('users')
        .select('ic_number')
        .eq('ic_number', newUser.icNumber.trim())
        .maybeSingle();

      if (existingUser) {
        setError('ID Pengguna ini sudah wujud dalam sistem');
        setIsSubmitting(false);
        return;
      }

      // Prepare data for Supabase (snake_case)
      const dbData = {
        name: newUser.name.trim(),
        ic_number: newUser.icNumber.trim(),
        email: newUser.email.trim(),
        role: newUser.role,
        student_id: newUser.role === 'student' ? studentId : null,
        class: newUser.class?.trim() || null,
        dormitory_block: null,
        dormitory_room: null,
        profile_completed: false,
        profile: null,
        password_hash: '123456', // Default password - should be hashed in production
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Insert into Supabase
      const { data, error } = await supabase
        .from('users')
        .insert(dbData)
        .select()
        .single();

      if (error) {
        console.error('Error adding user:', error);
        setError('Ralat semasa menambah pengguna. Sila cuba lagi.');
        setIsSubmitting(false);
        return;
      }

      if (data) {
        // Map database user to app format
        const mappedUser = {
          id: data.id,
          name: data.name,
          icNumber: data.ic_number,
          email: data.email,
          role: data.role,
          studentId: data.student_id || undefined,
          class: data.class || undefined,
          dormitoryBlock: data.dormitory_block || undefined,
          dormitoryRoom: data.dormitory_room || undefined,
          profileCompleted: data.profile_completed || false,
          profile: data.profile || undefined,
          createdAt: new Date(data.created_at),
        };

        // Update local state
        setUsers(prev => [mappedUser, ...prev]);
        setSuccess(`Pengguna ${newUser.name} berjaya ditambah ke sistem`);
        
        // Reset form
        setNewUser({
          name: '',
          icNumber: '',
          role: 'student',
          email: '',
          studentId: '',
          class: '',
        });
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Error adding user:', error);
      setError('Ralat semasa menambah pengguna. Sila cuba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === user?.id) {
      setError('Anda tidak boleh memadam akaun anda sendiri');
      setDeleteConfirm(null);
      return;
    }

    try {
      // Delete from Supabase
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) {
        console.error('Error deleting user:', error);
        setError('Ralat semasa memadam pengguna. Sila cuba lagi.');
        setDeleteConfirm(null);
        return;
      }

      // Update local state
      const updatedUsers = users.filter((u) => u.id !== userId);
      setUsers(updatedUsers);
      setSuccess('Pengguna berjaya dipadam');
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Ralat semasa memadam pengguna. Sila cuba lagi.');
      setDeleteConfirm(null);
    }
  };

  // Filter users based on selected filters
  const filteredUsers = users.filter((userData) => {
    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      const matchesSearch = 
        userData.name.toLowerCase().includes(searchLower) ||
        userData.icNumber.includes(filters.searchTerm) ||
        userData.email.toLowerCase().includes(searchLower) ||
        (userData.studentId && userData.studentId.toLowerCase().includes(searchLower));
      
      if (!matchesSearch) return false;
    }

    // User type filter
    if (filters.userType !== 'all' && userData.role !== filters.userType) {
      return false;
    }

    // Account status filter (assuming all users are active for now)
    if (filters.accountStatus !== 'all') {
      const isActive = userData.profileCompleted !== false;
      if (filters.accountStatus === 'active' && !isActive) return false;
      if (filters.accountStatus === 'inactive' && isActive) return false;
    }

    // Student category filter
    if (filters.studentCategory !== 'all' && userData.role === 'student') {
      const isHostelStudent = userData.profile?.residenceStatus === 'Pelajar Asrama';
      if (filters.studentCategory === 'asrama' && !isHostelStudent) return false;
      if (filters.studentCategory === 'harian' && isHostelStudent) return false;
    }

    return true;
  });

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'student': return 'Pelajar';
      case 'hep': return 'Ketua HEP';
      case 'warden': return 'Ketua Warden';
      case 'security': return 'Pengawal Keselamatan';
      case 'admin': return 'Pentadbir Sistem';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'student': return 'bg-blue-100 text-blue-800';
      case 'hep': return 'bg-green-100 text-green-800';
      case 'warden': return 'bg-purple-100 text-purple-800';
      case 'security': return 'bg-orange-100 text-orange-800';
      case 'admin': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-1">
                <img 
                  src="/logo_kv copy.png" 
                  alt="KV Logo" 
                  className="w-12 h-8 object-contain"
                />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Pengurusan Pengguna</h2>
                <p className="text-sm text-gray-600">Urus akaun pengguna dalam sistem KVB-PASS</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Pengguna</span>
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Messages */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800">{success}</p>
            </div>
          )}

          {/* Search and Filter Controls */}
          <div className="mb-6 space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={filters.searchTerm}
                    onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                    placeholder="Cari nama, No K/P, email, atau No Pelajar..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center space-x-2 px-4 py-3 rounded-lg border transition-colors ${
                  showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </button>
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jenis Pengguna
                    </label>
                    <select
                      value={filters.userType}
                      onChange={(e) => setFilters(prev => ({ ...prev, userType: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Semua Pengguna</option>
                      <option value="student">Pelajar</option>
                      <option value="hep">Ketua HEP</option>
                      <option value="warden">Warden</option>
                      <option value="security">Pengawal Keselamatan</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status Akaun
                    </label>
                    <select
                      value={filters.accountStatus}
                      onChange={(e) => setFilters(prev => ({ ...prev, accountStatus: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Semua Status</option>
                      <option value="active">Aktif</option>
                      <option value="inactive">Tidak Aktif</option>
                    </select>
                  </div>

                  {filters.userType === 'student' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kategori Pelajar
                      </label>
                      <select
                        value={filters.studentCategory}
                        onChange={(e) => setFilters(prev => ({ ...prev, studentCategory: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">Semua Kategori</option>
                        <option value="asrama">Pelajar Asrama</option>
                        <option value="harian">Pelajar Harian</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => setFilters({ userType: 'all', accountStatus: 'all', studentCategory: 'all', searchTerm: '' })}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Reset Filter
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Add User Form */}
          {showAddForm && (
            <div className="mb-6 bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  <UserPlus className="w-5 h-5 inline mr-2" />
                  Tambah Pengguna Baru
                </h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddUser} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Penuh *
                    </label>
                    <input
                      type="text"
                      value={newUser.name}
                      onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Masukkan nama penuh"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ID Pengguna (12 digit) *
                    </label>
                    <input
                      type="text"
                      value={newUser.icNumber}
                      onChange={(e) => setNewUser(prev => ({ ...prev, icNumber: e.target.value }))}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Masukkan ID pengguna"
                      maxLength={12}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kategori Pengguna *
                    </label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value as 'student' | 'hep' | 'warden' | 'security' }))}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="student">Pelajar</option>
                      <option value="hep">Ketua Hal Ehwal Pelajar</option>
                      <option value="warden">Ketua Warden Asrama</option>
                      <option value="security">Pengawal Keselamatan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alamat E-mel *
                    </label>
                    <input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Masukkan alamat e-mel"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Maklumat Penting</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Kata laluan awal untuk semua pengguna baru ialah: <strong>123456</strong></li>
                        <li>Pengguna boleh menukar kata laluan selepas log masuk pertama</li>
                        <li>Pelajar perlu melengkapkan profil sebelum menggunakan sistem</li>
                        {newUser.role === 'student' && (
                          <li>No. Pelajar akan dijana secara automatik: <strong>KV2024{String(users.filter((u) => u.role === 'student').length + 1).padStart(3, '0')}</strong></li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Menambah...' : 'Tambah Pengguna'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Users List */}
          <div className="bg-white rounded-xl border border-gray-100">
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-lg font-medium text-gray-900">
                Senarai Pengguna ({filteredUsers.length} daripada {users.length})
              </h3>
            </div>

            <div className="divide-y divide-gray-100">
              {isLoadingUsers ? (
                <div className="p-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="text-gray-500 mt-4">Memuatkan senarai pengguna...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-8 text-center">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Tiada pengguna dijumpai mengikut kriteria carian</p>
                </div>
              ) : (
                filteredUsers.map((userData) => (
                <div key={userData.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-medium text-gray-900">{userData.name}</h4>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(userData.role)}`}>
                          {getRoleDisplay(userData.role)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          userData.profileCompleted !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {userData.profileCompleted !== false ? 'Aktif' : 'Tidak Aktif'}
                        </span>
                        {userData.role === 'student' && userData.studentId && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            {userData.studentId}
                          </span>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-2">
                        <p><strong>ID Pengguna:</strong> {userData.icNumber}</p>
                        <p><strong>E-mel:</strong> {userData.email}</p>
                        {userData.class && (
                          <p><strong>Kelas:</strong> {userData.class}</p>
                        )}
                        
                        {/* Extended Student Information */}
                        {userData.role === 'student' && userData.profile && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <h5 className="font-medium text-blue-900 mb-3">Maklumat Terperinci Pelajar</h5>
                            <div className="flex items-start space-x-4">
                              {/* Student Photo */}
                              <div className="w-16 h-20 bg-gray-100 rounded border flex items-center justify-center overflow-hidden flex-shrink-0">
                                {userData.profile.profilePhoto ? (
                                  <img 
                                    src={userData.profile.profilePhoto} 
                                    alt="Gambar Pasport" 
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="text-center">
                                    <User className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                                    <p className="text-xs text-gray-500">Foto</p>
                                  </div>
                                )}
                              </div>
                              {/* Student Details */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs flex-1">
                              <div>
                                <p><strong>Telefon:</strong> {userData.profile.phoneNumber || 'Tidak dinyatakan'}</p>
                                <p><strong>Program:</strong> {userData.profile.program || 'Tidak dinyatakan'}</p>
                                <p><strong>Tahun:</strong> {userData.profile.studyYear || 'Tidak dinyatakan'}</p>
                                <p><strong>Status:</strong> {userData.profile.residenceStatus || 'Tidak dinyatakan'}</p>
                                {userData.profile.dormitoryBlock && userData.profile.dormitoryRoom && (
                                  <p><strong>Asrama:</strong> {userData.profile.dormitoryBlock}{userData.profile.dormitoryRoom}</p>
                                )}
                              </div>
                              <div>
                                <p><strong>Alamat:</strong> {userData.profile.homeAddress || 'Tidak dinyatakan'}</p>
                                <p><strong>Ibu Bapa:</strong> {userData.profile.parentName || 'Tidak dinyatakan'}</p>
                                <p><strong>Tel. Ibu Bapa:</strong> {userData.profile.parentPhone || 'Tidak dinyatakan'}</p>
                              </div>
                            </div>
                            </div>
                          </div>
                        )}
                        
                        <p><strong>Dicipta:</strong> {new Date(userData.createdAt).toLocaleDateString('ms-MY')}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {userData.id !== user?.id && (
                        <button
                          onClick={() => setDeleteConfirm(userData.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Padam pengguna"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      {userData.role === 'student' && (
                        <button
                          onClick={() => {
                            if (user?.role === 'admin' || user?.role === 'hep' || user?.role === 'warden') {
                              setSelectedStudentView(userData.id);
                            }
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Lihat maklumat penuh pelajar"
                          style={{ 
                            display: (user?.role === 'admin' || user?.role === 'hep' || user?.role === 'warden') ? 'block' : 'none' 
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Delete Confirmation */}
                  {deleteConfirm === userData.id && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm text-red-800 mb-3">
                            <strong>Adakah anda pasti ingin memadam pengguna ini?</strong>
                          </p>
                          <p className="text-sm text-red-700 mb-4">
                            Pengguna: <strong>{userData.name}</strong> ({userData.icNumber})
                            <br />
                            Tindakan ini tidak boleh dibatalkan dan semua data pengguna akan hilang.
                          </p>
                          <div className="flex space-x-3">
                            <button
                              onClick={() => handleDeleteUser(userData.id)}
                              className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors font-medium"
                            >
                              Ya, Padam Pengguna
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="px-4 py-2 bg-gray-200 text-gray-800 text-sm rounded-lg hover:bg-gray-300 transition-colors"
                            >
                              Batal
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Student Details View Modal */}
      {selectedStudentView && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-1">
                    <img 
                      src="/logo_kv copy.png" 
                      alt="KV Logo" 
                      className="w-12 h-8 object-contain"
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Maklumat Penuh Pelajar</h2>
                    <p className="text-sm text-gray-600">Lihat semua data yang diisi oleh pelajar</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStudentView(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Student Details Content */}
            <div className="p-6">
              {(() => {
                const student = users.find((u) => u.id === selectedStudentView);
                if (!student) return <p>Pelajar tidak dijumpai</p>;

                return (
                  <div className="space-y-6">
                    {/* Student Photo and Basic Info */}
                    <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                      <div className="flex items-start space-x-6">
                        {/* Student Photo */}
                        <div className="flex-shrink-0">
                          <div className="w-32 h-40 bg-gray-100 rounded-lg border-2 border-gray-300 flex items-center justify-center overflow-hidden">
                            {student.profile?.profilePhoto ? (
                              <img 
                                src={student.profile.profilePhoto} 
                                alt="Gambar Pasport Pelajar" 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="text-center">
                                <User className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                <p className="text-xs text-gray-500">Tiada</p>
                                <p className="text-xs text-gray-500">Gambar</p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Basic Information */}
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-blue-900 mb-4">{student.name}</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-blue-800 mb-1">ID Pengguna</label>
                              <p className="text-blue-900 font-mono">{student.icNumber}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-blue-800 mb-1">No. Pelajar</label>
                              <p className="text-blue-900 font-mono">{student.studentId}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-blue-800 mb-1">E-mel</label>
                              <p className="text-blue-900">{student.email}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-blue-800 mb-1">Status Akaun</label>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                student.profileCompleted !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {student.profileCompleted !== false ? 'Aktif' : 'Tidak Aktif'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Profile Information */}
                    {student.profile && (
                      <div className="space-y-6">
                        {/* Personal Information */}
                        <div className="bg-white rounded-xl p-6 border border-gray-200">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <User className="w-5 h-5 mr-2 text-gray-600" />
                            Maklumat Peribadi
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Penuh</label>
                              <p className="text-gray-900">{student.profile.fullName}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Jantina</label>
                              <p className="text-gray-900">{student.profile.gender}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Nombor Telefon</label>
                              <p className="text-gray-900 font-mono">{student.profile.phoneNumber}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Status Kediaman</label>
                              <p className="text-gray-900">{student.profile.residenceStatus}</p>
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Rumah</label>
                              <p className="text-gray-900">{student.profile.homeAddress}</p>
                            </div>
                          </div>
                        </div>

                        {/* Academic Information */}
                        <div className="bg-white rounded-xl p-6 border border-gray-200">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <GraduationCap className="w-5 h-5 mr-2 text-gray-600" />
                            Maklumat Akademik
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Program Pengajian</label>
                              <p className="text-gray-900">{student.profile.program}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Tahun Pengajian</label>
                              <p className="text-gray-900">{student.profile.studyYear}</p>
                            </div>
                            {student.profile.dormitoryBlock && student.profile.dormitoryRoom && (
                              <>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Blok Asrama</label>
                                  <p className="text-gray-900">{student.profile.dormitoryBlock}</p>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Dorm</label>
                                  <p className="text-gray-900">{student.profile.dormitoryRoom}</p>
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Parent/Guardian Information */}
                        <div className="bg-white rounded-xl p-6 border border-gray-200">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Users className="w-5 h-5 mr-2 text-gray-600" />
                            Maklumat Ibu Bapa/Penjaga
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Ibu Bapa/Penjaga</label>
                              <p className="text-gray-900">{student.profile.parentName}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Nombor Telefon</label>
                              <p className="text-gray-900 font-mono">{student.profile.parentPhone}</p>
                            </div>
                          </div>
                        </div>

                        {/* Account Information */}
                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Shield className="w-5 h-5 mr-2 text-gray-600" />
                            Maklumat Akaun
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Tarikh Dicipta</label>
                              <p className="text-gray-900">{new Date(student.createdAt).toLocaleString('ms-MY')}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Profil Lengkap</label>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                student.profileCompleted !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {student.profileCompleted !== false ? 'Ya' : 'Tidak'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* If profile not completed */}
                    {!student.profile && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                        <div className="flex items-center space-x-3">
                          <AlertCircle className="w-6 h-6 text-yellow-600" />
                          <div>
                            <h4 className="font-medium text-yellow-800">Profil Belum Lengkap</h4>
                            <p className="text-sm text-yellow-700">Pelajar ini belum melengkapkan maklumat profil mereka.</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;