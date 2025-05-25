import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ModeToggle } from '@/components/ModeToggle';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import ColorClassifierTester from '@/components/ColorClassifierTester';
import ColorExtractor from '@/components/ColorExtractor';

const Index = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <nav className="container mx-auto p-4 flex justify-between items-center">
        <span className="font-bold text-xl text-gray-900 dark:text-white">
          Color Tools
        </span>
        <div className="flex items-center space-x-4">
          <ModeToggle />
        </div>
      </nav>
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Color Library Manager
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage, classify, and analyze your digital color collections
          </p>
        </div>

        <div className="space-y-8">
          {/* Add Color Extractor Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              Extract Colors from Web
            </h2>
            <ColorExtractor />
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              Color Classifier
            </h2>
            <ColorClassifierTester />
          </section>
        </div>
      </main>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="outline">Open</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account
              and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Index;
