import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { useMutation } from '@apollo/client/react';
import { gql } from '@apollo/client/core';
import { REGISTER_MUTATION } from '../../services/auth';
import { MaterialIcons } from '@expo/vector-icons';

interface RegisterResponse {
  register: {
    token: string;
    email: string;
    role: string;
  };
}

export default function RegisterScreen() {
  const router = useRouter();
  const { login: saveAuth } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [registerMutation] = useMutation<RegisterResponse>(REGISTER_MUTATION);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { data } = await registerMutation({
        variables: {
          input: {
            name,
            email,
            password,
            role: 'CUSTOMER', // Default role for new users
          },
        },
      });

      if (data?.register) {
        await saveAuth(data.register.token, {
          email: data.register.email,
          role: data.register.role,
          name,
        });
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Liquid Glow Backgrounds */}
      <View style={styles.liquidGlowRed} />
      <View style={styles.liquidGlowBlue} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.brandTitle}>Create Account</Text>
              <Text style={styles.brandSubtitle}>
                Join A-Spree to access products from your nearest branch.
              </Text>
            </View>

            {/* Register Form */}
            <View style={styles.glassPanel}>
              <View style={styles.formContainer}>
                {/* Name Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <View style={styles.inputWrapper}>
                    <MaterialIcons name="person" size={20} color="#8f8f8f" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="John Doe"
                      placeholderTextColor="#8f9494"
                      value={name}
                      onChangeText={setName}
                      autoCapitalize="words"
                      autoComplete="name"
                    />
                  </View>
                </View>

                {/* Email Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email or Phone</Text>
                  <View style={styles.inputWrapper}>
                    <MaterialIcons name="email" size={20} color="#8f8f8f" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="user@aspree.com"
                      placeholderTextColor="#8f9494"
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      autoComplete="email"
                    />
                  </View>
                </View>

                {/* Password Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <View style={styles.inputWrapper}>
                    <MaterialIcons name="lock" size={20} color="#8f8f8f" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Min. 6 characters"
                      placeholderTextColor="#8f9494"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoComplete="password-new"
                    />
                    <TouchableOpacity
                      style={styles.togglePassword}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <MaterialIcons 
                        name={showPassword ? 'visibility-off' : 'visibility'} 
                        size={20} 
                        color="#8f8f8f" 
                        style={styles.toggleIcon} 
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Confirm Password Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Confirm Password</Text>
                  <View style={styles.inputWrapper}>
                    <MaterialIcons name="lock" size={20} color="#8f8f8f" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Re-enter your password"
                      placeholderTextColor="#8f9494"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showPassword}
                      autoComplete="password-new"
                    />
                  </View>
                </View>

                {/* Error Message */}
                {error ? (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}

                {/* Sign Up Button */}
                <TouchableOpacity
                  style={styles.signUpButton}
                  onPress={handleRegister}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <>
                      <Text style={styles.signUpButtonText}>Create Account</Text>
                      <MaterialIcons name="arrow-forward" size={18} color="#ffffff" style={styles.arrowIcon} />
                    </>
                  )}
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>Or continue with</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Social Logins */}
                <View style={styles.socialButtons}>
                  <TouchableOpacity style={styles.socialButton}>
                    <Text style={styles.socialButtonText}>Google</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.socialButton}>
                    <Text style={styles.socialButtonText}>Apple</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Footer / Sign In */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Link href={"/(auth)/login" as any} asChild>
                <TouchableOpacity>
                  <Text style={styles.signInLink}>Sign in</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fafd',
  },
  liquidGlowRed: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(175, 16, 26, 0.15)',
    top: -50,
    left: -80,
    opacity: 0.6,
  },
  liquidGlowBlue: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(0, 121, 156, 0.12)',
    bottom: -50,
    right: -80,
    opacity: 0.6,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingVertical: 48,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  brandTitle: {
    fontFamily: 'System',
    fontSize: 32,
    fontWeight: '900',
    fontStyle: 'italic',
    color: '#af101a',
    letterSpacing: -1,
    marginBottom: 8,
  },
  brandSubtitle: {
    fontFamily: 'System',
    fontSize: 14,
    color: '#5d5f5f',
    textAlign: 'center',
    maxWidth: 280,
  },
  glassPanel: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#1b1c1c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  formContainer: {
    padding: 24,
    gap: 16,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#5b403d',
    paddingLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f6f3f2',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingVertical: 14,
    fontSize: 14,
    color: '#1b1c1c',
  },
  togglePassword: {
    padding: 8,
  },
  toggleIcon: {
  },
  errorContainer: {
    backgroundColor: '#ffdad6',
    padding: 12,
    borderRadius: 8,
  },
  errorText: {
    color: '#93000a',
    fontSize: 12,
  },
  signUpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#af101a',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  signUpButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  arrowIcon: {
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#dcd9d9',
  },
  dividerText: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#8f8f8f',
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eae7e7',
    paddingVertical: 12,
    borderRadius: 8,
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1b1c1c',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    paddingBottom: 32,
  },
  footerText: {
    fontSize: 14,
    color: '#8f8f8f',
  },
  signInLink: {
    fontSize: 14,
    color: '#af101a',
    fontWeight: '600',
  },
});