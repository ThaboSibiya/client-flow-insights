import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Premium Quikle Colors - Ultra Sophisticated Palette
				quikle: {
					primary: '#1F2937',       // Rich charcoal
					secondary: '#374151',     // Sophisticated gray
					accent: '#6B7280',        // Refined medium gray
					light: '#FAFAFA',         // Ultra clean white
					dark: '#111827',          // Deep charcoal
					success: '#059669',       // Elegant emerald
					info: '#0369A1',          // Premium blue
					danger: '#DC2626',        // Refined red
					neutral: '#9CA3AF',       // Balanced gray
					blue: '#1E40AF',          // Deep professional blue
					purple: '#7C3AED',        // Luxurious purple
					platinum: '#F3F4F6',      // Platinum white
					silver: '#E5E7EB',        // Silver gray
					pearl: '#FEFEFE',         // Pearl white
					charcoal: '#1F2937',      // Charcoal
					slate: '#64748B',         // Professional slate
					stone: '#78716C',         // Warm stone
					obsidian: '#0F172A',      // Deep obsidian
					diamond: '#FFFFFF',       // Pure diamond white
					crystal: '#F8FAFC',       // Crystal clear
				},
				// Keep legacy broker colors for compatibility but update to premium palette
				broker: {
					primary: '#1F2937',
					secondary: '#374151',
					accent: '#6B7280',
					light: '#FAFAFA',
					dark: '#111827',
					success: '#059669',
					info: '#0369A1',
					danger: '#DC2626',
					neutral: '#9CA3AF',
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'pulse-subtle': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.9' },
				},
				'shimmer': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(100%)' },
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'pulse-subtle': 'pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'shimmer': 'shimmer 2s infinite',
			},
			boxShadow: {
				'card-hover': '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
				'quikle-glow': '0 0 30px rgba(31, 41, 55, 0.1)',
				'premium': '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.8)',
				'elegant': '0 8px 30px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.05)',
				'luxury': '0 20px 40px -10px rgba(0, 0, 0, 0.15), 0 10px 20px -5px rgba(0, 0, 0, 0.1)',
				'platinum': '0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.06)',
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-quikle': 'linear-gradient(135deg, #FAFAFA 0%, #F3F4F6 30%, #E5E7EB 100%)',
				'gradient-quikle-light': 'linear-gradient(135deg, #FFFFFF 0%, #FAFAFA 100%)',
				'gradient-premium': 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 50%, #F1F5F9 100%)',
				'gradient-luxury': 'linear-gradient(135deg, #FEFEFE 0%, #F3F4F6 100%)',
				'gradient-platinum': 'linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 50%, #F3F4F6 100%)',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
