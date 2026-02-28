import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cn } from '@/lib/utils'

const Tabs = TabsPrimitive.Root

type TabsListVariant = 'default' | 'secondary'

interface TabsListProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> {
  variant?: TabsListVariant
}

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  TabsListProps
>(({ className, variant = 'default', ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      // Base styles
      'inline-flex items-center justify-center text-muted-foreground mx-auto',

      // Default variant (Parent tabs - Saffron theme)
      variant === 'default' && [
        'h-11 bg-card border border-border shadow-sm rounded-xl p-1.5 gap-1',
      ],

      // Secondary variant (Child tabs - Purple theme)
      variant === 'secondary' && [
        'h-10 bg-muted/40 border border-border rounded-lg p-1 gap-0.5',
      ],

      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

interface TabsTriggerProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
  variant?: TabsListVariant
}

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, variant = 'default', ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      // Base styles
      'inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium',
      'ring-offset-background transition-all duration-200',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-50',

      // Default variant (Parent tabs - SAFFRON active state)
      variant === 'default' && [
        'text-muted-foreground hover:text-foreground hover:bg-saffron/10',
        'data-[state=active]:bg-saffron data-[state=active]:text-saffron-foreground',
        'data-[state=active]:shadow-md data-[state=active]:font-semibold',
      ],

      // Secondary variant (Child tabs - PURPLE active state)
      variant === 'secondary' && [
        'text-muted-foreground hover:text-foreground hover:bg-primary/10',
        'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground',
        'data-[state=active]:shadow-sm',
      ],

      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-3 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
