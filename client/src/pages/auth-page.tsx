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
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 186.69 190.5" className="mr-2">
                            <g transform="translate(1184.583 765.171)">
                              <path clipPath="none" mask="none" d="M-1089.333-687.239v36.888h51.262c-2.251 11.863-9.006 21.908-19.137 28.662l30.913 23.986c18.011-16.625 28.402-41.044 28.402-70.052 0-6.754-.606-13.249-1.732-19.483z" fill="#4285f4"/>
                              <path clipPath="none" mask="none" d="M-1142.714-651.791l-6.972 5.337-24.679 19.223h0c15.673 31.086 47.796 52.561 85.03 52.561 25.717 0 47.278-8.486 63.038-23.033l-30.913-23.986c-8.486 5.715-19.31 9.179-32.125 9.179-24.765 0-45.806-16.712-53.34-39.226z" fill="#34a853"/>
                              <path clipPath="none" mask="none" d="M-1174.365-712.61c-6.494 12.815-10.217 27.276-10.217 42.689s3.723 29.874 10.217 42.689c0 .086 31.693-24.592 31.693-24.592-1.905-5.715-3.031-11.776-3.031-18.098s1.126-12.383 3.031-18.098z" fill="#fbbc05"/>
                              <path clipPath="none" mask="none" d="M-1089.333-727.244c14.028 0 26.497 4.849 36.455 14.201l27.276-27.276c-16.539-15.413-38.013-24.852-63.731-24.852-37.234 0-69.359 21.388-85.032 52.561l31.692 24.592c7.533-22.514 28.575-39.226 53.34-39.226z" fill="#ea4335"/>
                            </g>
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
