import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginUserSchema, registerUserSchema, LoginUser, RegisterUser } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import Logo from "@/components/Logo";
import { motion, AnimatePresence } from "framer-motion";
import { CarIllustration } from "@/components/CarIllustration";
import { MusicIllustration } from "@/components/MusicIllustration";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { user, loginMutation, registerMutation } = useAuth();
  const [, navigate] = useLocation();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Login form
  const loginForm = useForm<LoginUser>({
    resolver: zodResolver(loginUserSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<RegisterUser>({
    resolver: zodResolver(registerUserSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onLoginSubmit = (data: LoginUser) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterUser) => {
    registerMutation.mutate(data);
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Side - Thematic Illustration */}
      <div className="md:w-1/2 relative overflow-hidden">
        <div className={`absolute inset-0 flex items-center justify-center p-6 transition-colors duration-500 ${isLogin ? 'bg-blue-50' : 'bg-purple-50'}`}>
          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.div
                key="car-illustration"
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ duration: 0.5 }}
                className="w-full h-full max-w-md mx-auto"
              >
                <CarIllustration className="w-full h-full" />
              </motion.div>
            ) : (
              <motion.div
                key="music-illustration"
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ duration: 0.5 }}
                className="w-full h-full max-w-md mx-auto"
              >
                <MusicIllustration className="w-full h-full" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="absolute top-0 left-0 p-6">
          <Logo />
        </div>
        <motion.div 
          className="absolute bottom-4 left-0 right-0 text-center text-sm text-gray-600"
          key={isLogin ? "login-slogan" : "register-slogan"}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          {isLogin ? "Your road trip's perfect soundtrack" : "Create your personalized road trip playlists"}
        </motion.div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="md:w-1/2 flex flex-col justify-center items-center p-8">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.div
                key="login-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="border-0 shadow-none">
                  <CardContent className="pt-6">
                    <div className="mb-8 text-center">
                      <h2 className="text-3xl font-bold mb-1">Sign In</h2>
                      <div className="w-16 h-1 bg-primary mx-auto rounded-full"></div>
                    </div>

                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                        <FormField
                          control={loginForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input placeholder="email@example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="text-right">
                          <a href="#" className="text-sm text-primary hover:text-primary-dark transition-colors duration-200">
                            Forgot Password?
                          </a>
                        </div>

                        <Button 
                          type="submit" 
                          className="w-full bg-secondary hover:bg-green-600" 
                          disabled={loginMutation.isPending}
                        >
                          {loginMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Signing In...
                            </>
                          ) : (
                            "Sign In"
                          )}
                        </Button>

                        <div className="relative flex items-center justify-center my-4">
                          <div className="border-t border-gray-300 absolute w-full"></div>
                          <div className="bg-white px-4 relative z-10 text-sm text-gray-500">or continue with</div>
                        </div>

                        <Button 
                          type="button" 
                          variant="outline"
                          className="w-full"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" className="mr-2">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                          Google
                        </Button>

                        <div className="text-center text-sm mt-4">
                          <span className="text-gray-600">Don't have an account?</span>
                          <Button 
                            variant="link" 
                            className="text-primary p-0 h-auto font-medium hover:text-primary-dark ml-1" 
                            onClick={toggleForm}
                          >
                            Sign Up
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="register-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
              >
                <Card className="border-0 shadow-none">
                  <CardContent className="pt-6">
                    <div className="mb-8 text-center">
                      <h2 className="text-3xl font-bold mb-1">Sign Up</h2>
                      <div className="w-16 h-1 bg-primary mx-auto rounded-full"></div>
                    </div>

                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-6">
                        <FormField
                          control={registerForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input placeholder="email@example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={registerForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm Password</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button 
                          type="submit"
                          className="w-full" 
                          disabled={registerMutation.isPending}
                        >
                          {registerMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Signing Up...
                            </>
                          ) : (
                            "Sign Up"
                          )}
                        </Button>

                        <div className="text-center text-sm mt-4">
                          <span className="text-gray-600">Already have an account?</span>
                          <Button 
                            variant="link" 
                            className="text-primary p-0 h-auto font-medium hover:text-primary-dark ml-1" 
                            onClick={toggleForm}
                          >
                            Sign In
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
