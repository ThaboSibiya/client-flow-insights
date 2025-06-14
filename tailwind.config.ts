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
				// Premium Quikle Colors - Sophisticated Palette
				quikle: {
					primary: '#2D3748',       // Sophisticated dark gray
					secondary: '#4A5568',     // Medium gray
					accent: '#718096',        // Light gray
					light: '#F7FAFC',         // Very light gray/white
					dark: '#1A202C',          // Very dark gray
					success: '#38A169',       // Refined green
					warning: '#D69E2E',       // Muted gold instead of bright yellow
					danger: '#E53E3E',        // Refined red
					neutral: '#A0AEC0',       // Neutral gray
					blue: '#4299E1',          // Refined blue
					purple: '#805AD5',        // Refined purple
					platinum: '#E2E8F0',      // Platinum gray
					silver: '#CBD5E0',        // Silver gray
					pearl: '#F8F9FA',         // Pearl white
					charcoal: '#2D3748',      // Charcoal gray
					slate: '#64748B',         // Slate gray
					stone: '#78716C',         // Stone gray
				},
				// Keep legacy broker colors for compatibility but update to premium palette
				broker: {
					primary: '#2D3748',
					secondary: '#4A5568',
					accent: '#718096',
					light: '#F7FAFC',
					dark: '#1A202C',
					success: '#38A169',
					warning: '#D69E2E',
					danger: '#E53E3E',
					neutral: '#A0AEC0',
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
					'50%': { opacity: '0.8' },
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'pulse-subtle': 'pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
			},
			boxShadow: {
				'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
				'quikle-glow': '0 0 20px rgba(45, 55, 72, 0.15)',
				'premium': '0 25px 50px -12px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.05)',
				'elegant': '0 4px 20px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.05)',
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-quikle': 'linear-gradient(135deg, #F7FAFC 0%, #E2E8F0 30%, #CBD5E0 100%)',
				'gradient-quikle-light': 'linear-gradient(135deg, #FFFFFF 0%, #F7FAFC 100%)',
				'gradient-premium': 'linear-gradient(135deg, #FFFFFF 0%, #F8F9FA 50%, #F1F5F9 100%)',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
