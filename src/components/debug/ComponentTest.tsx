import React from 'react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Crown, Brain, Puzzle } from 'lucide-react';

const ComponentTest: React.FC = () => {
  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="space-y-8">
        {/* Header Test */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-4">Component Test Page</h1>
          <p className="text-muted-foreground">Testing shadcn/ui components to identify UI issues</p>
        </div>

        {/* Button Test */}
        <Card>
          <CardHeader>
            <CardTitle>Button Components</CardTitle>
            <CardDescription>Testing different button variants and sizes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button>Default Button</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button size="sm">Small</Button>
              <Button size="lg">Large</Button>
              <Button size="icon">
                <Crown className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Icon Test */}
        <Card>
          <CardHeader>
            <CardTitle>Lucide Icons</CardTitle>
            <CardDescription>Testing icon rendering and sizes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Crown className="h-4 w-4" />
              <span>h-4 w-4</span>
            </div>
            <div className="flex items-center gap-4">
              <Brain className="h-6 w-6" />
              <span>h-6 w-6</span>
            </div>
            <div className="flex items-center gap-4">
              <Puzzle className="h-8 w-8" />
              <span>h-8 w-8</span>
            </div>
            <div className="flex items-center gap-4">
              <Crown className="h-16 w-16" />
              <span>h-16 w-16 (should be big but not distorted)</span>
            </div>
          </CardContent>
        </Card>

        {/* Card Test */}
        <Card>
          <CardHeader>
            <CardTitle>Card Layout</CardTitle>
            <CardDescription>Testing card component styling</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This card should have proper spacing, borders, and background.</p>
            <div className="mt-4">
              <Badge>Demo Badge</Badge>
              <Badge variant="secondary" className="ml-2">Secondary Badge</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Grid Test */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((num) => (
            <Card key={num}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-blue-500">
                    <Crown className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">Card {num}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Action Button</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComponentTest;