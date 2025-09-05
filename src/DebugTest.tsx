import React from 'react';
import { Button } from './components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/card';
import { Badge } from './components/ui/badge';

function DebugTest() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-red-600 mb-8">
        🔧 TAILWIND & SHADCN/UI DEBUG TEST
      </h1>
      
      {/* Tailwind CSS Test */}
      <div className="border-2 border-blue-500 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">✅ Tailwind CSS Test:</h2>
        <div className="bg-blue-500 text-white p-4 rounded-lg mb-4 shadow-md">
          ✅ SUCCESS! If this has blue background, white text, padding, rounded corners and shadow - Tailwind is working!
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-500 text-white p-3 text-center rounded">Green</div>
          <div className="bg-purple-500 text-white p-3 text-center rounded">Purple</div>
          <div className="bg-orange-500 text-white p-3 text-center rounded">Orange</div>
        </div>
      </div>

      {/* shadcn/ui Component Test */}
      <div className="border-2 border-green-500 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">✅ shadcn/ui Components Test:</h2>
        
        <div className="space-y-4">
          {/* Button Test */}
          <div>
            <h3 className="font-medium mb-2">Button Components:</h3>
            <div className="flex gap-2 flex-wrap">
              <Button>Primary Button</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
          </div>

          {/* Badge Test */}
          <div>
            <h3 className="font-medium mb-2">Badge Components:</h3>
            <div className="flex gap-2 flex-wrap">
              <Badge>Default Badge</Badge>
              <Badge variant="secondary">Secondary Badge</Badge>
            </div>
          </div>

          {/* Card Test */}
          <div>
            <h3 className="font-medium mb-2">Card Component:</h3>
            <Card className="max-w-md">
              <CardHeader>
                <CardTitle>Test Card</CardTitle>
              </CardHeader>
              <CardContent>
                <p>This is a test card using shadcn/ui components. If it looks styled properly with borders and spacing, shadcn/ui is working!</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Navigation Test */}
      <div className="border-2 border-orange-500 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">🔗 Navigation Test:</h2>
        <div className="space-y-2">
          <Button asChild className="w-full justify-start">
            <a href="#dashboard">🏠 Dashboard</a>
          </Button>
          <Button asChild variant="outline" className="w-full justify-start">
            <a href="#lessons">📚 Lessons</a>
          </Button>
          <Button asChild variant="secondary" className="w-full justify-start">
            <a href="#puzzles">🧩 Puzzles</a>
          </Button>
        </div>
      </div>

      {/* Status Report */}
      <div className="border-2 border-gray-300 p-6 rounded-lg bg-gray-50">
        <h2 className="text-xl font-semibold mb-4">📊 Status Report:</h2>
        <ul className="space-y-2">
          <li className="flex items-center gap-2">
            <span className="w-4 h-4 bg-green-500 rounded-full"></span>
            <span>If everything above is styled correctly, the UI is fixed!</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-4 h-4 bg-red-500 rounded-full"></span>
            <span>If components look unstyled, there are still issues</span>
          </li>
        </ul>
        
        <div className="mt-4 p-4 bg-blue-100 rounded border-l-4 border-blue-500">
          <p className="text-blue-800">
            <strong>Next Step:</strong> If everything looks good here, we can restore the full Chess Academy app!
          </p>
        </div>
      </div>
    </div>
  );
}

export default DebugTest;