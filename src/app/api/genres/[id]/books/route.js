import { supabase } from '../../../../../../lib/supabase';

// GET /api/genres/[id]/books - Get books by genre ID
export async function GET(request, { params }) {
    try {
        const { id } = params;

        // Input validation
        if (!id || isNaN(parseInt(id))) {
            return new Response(JSON.stringify({ 
                error: 'Invalid genre ID provided' 
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // First verify the genre exists
        const { data: genre, error: genreError } = await supabase
            .from('genres')
            .select('id')
            .eq('id', id)
            .single();

        if (genreError || !genre) {
            return new Response(JSON.stringify({ 
                error: 'Genre not found' 
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Fetch books for the specified genre with minimal details
        const { data: books, error } = await supabase
            .from('book_genres')
            .select(`
                book:books (
                    id,
                    title,
                    cover_url
                )
            `)
            .eq('genre_id', id);

        if (error) {
            console.error('Database error:', error);
            throw new Error('Failed to fetch books from database');
        }

        // Transform the data to match the required format
        const formattedBooks = books
            .map(item => item.book)
            .filter(book => book !== null);

        if (formattedBooks.length === 0) {
            return new Response(JSON.stringify({ 
                message: 'No books found for this genre',
                data: [] 
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({
            data: formattedBooks,
            count: formattedBooks.length
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Error in books by genre endpoint:', error);
        return new Response(JSON.stringify({ 
            error: error.message || 'Failed to fetch books',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
