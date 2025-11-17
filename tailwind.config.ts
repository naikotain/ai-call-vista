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
				// Colores base para tema oscuro
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))', // Negro puro
				foreground: 'hsl(var(--foreground))', // Blanco puro
				primary: {
					DEFAULT: 'hsl(var(--primary))', // Azul eléctrico
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))', // Gris oscuro
					foreground: 'hsl(var(--secondary-foreground))'
				},
				// Colores de estado vibrantes
				success: {
					DEFAULT: 'hsl(var(--success))', // Verde neón
					foreground: 'hsl(var(--success-foreground))'
				},
				info: {
					DEFAULT: 'hsl(var(--info))', // Azul brillante
					foreground: 'hsl(var(--info-foreground))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))', // Amarillo eléctrico
					foreground: 'hsl(var(--warning-foreground))'
				},
				danger: {
					DEFAULT: 'hsl(var(--danger))', // Rojo intenso
					foreground: 'hsl(var(--danger-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))', // Negro intenso
					foreground: 'hsl(var(--muted-foreground))' // Gris medio
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))', // Gris oscuro
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))', // Cards casi negro
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))', // Negro con textura
					foreground: 'hsl(var(--card-foreground))'
				}
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
				// Nuevas animaciones para tema oscuro
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'slide-in': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(0)' }
				},
				'pulse-glow': {
					'0%, 100%': { 
						boxShadow: '0 0 5px hsl(var(--primary) / 0.3)' 
					},
					'50%': { 
						boxShadow: '0 0 20px hsl(var(--primary) / 0.6)' 
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.5s ease-out',
				'slide-in': 'slide-in 0.3s ease-out',
				'pulse-glow': 'pulse-glow 2s ease-in-out infinite'
			},
			boxShadow: {
				'metric': 'var(--metric-shadow)',
				'glow': '0 0 20px hsl(var(--primary) / 0.15)',
				'glow-lg': '0 0 40px hsl(var(--primary) / 0.25)'
			},
			backgroundImage: {
				'gradient-primary': 'var(--primary-gradient)',
				'grid-pattern': `
					linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
					linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
				`
			},
			backdropBlur: {
				xs: '2px'
			},
			// Mejoras de tipografía para mejor legibilidad en oscuro
			fontSize: {
				'xs': ['0.75rem', { lineHeight: '1rem' }],
				'sm': ['0.875rem', { lineHeight: '1.25rem' }],
				'base': ['1rem', { lineHeight: '1.5rem' }],
				'lg': ['1.125rem', { lineHeight: '1.75rem' }],
				'xl': ['1.25rem', { lineHeight: '1.75rem' }],
				'2xl': ['1.5rem', { lineHeight: '2rem' }],
				'3xl': ['1.875rem', { lineHeight: '2.25rem' }],
				'4xl': ['2.25rem', { lineHeight: '2.5rem' }]
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;