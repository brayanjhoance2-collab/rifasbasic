import { NextResponse } from 'next/server'
import { procesarCallbackGoogle } from '@/_Pages/googlesheet/servidor'

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const code = searchParams.get('code')
        const error = searchParams.get('error')
        const state = searchParams.get('state')

        // Si el usuario canceló la autorización
        if (error) {
            console.log('Error en OAuth:', error)
            const errorMessage = error === 'access_denied' 
                ? 'Autorización cancelada por el usuario'
                : 'Error en la autorización de Google'
                
            return NextResponse.redirect(
                new URL(`/googlesheets?error=${encodeURIComponent(errorMessage)}`, request.url)
            )
        }

        // Si no hay código de autorización
        if (!code) {
            return NextResponse.redirect(
                new URL('/googlesheets?error=Código de autorización no recibido', request.url)
            )
        }

        // Procesar el código de autorización
        const resultado = await procesarCallbackGoogle(code)

        if (resultado.success) {
            return NextResponse.redirect(
                new URL('/googlesheets?success=Conectado exitosamente a Google Sheets', request.url)
            )
        } else {
            return NextResponse.redirect(
                new URL(`/googlesheets?error=${encodeURIComponent(resultado.error)}`, request.url)
            )
        }

    } catch (error) {
        console.log('Error en callback de Google:', error)
        
        return NextResponse.redirect(
            new URL('/googlesheets?error=Error interno del servidor', request.url)
        )
    }
}