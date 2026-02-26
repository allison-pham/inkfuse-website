import { supabase } from '../../../../lib/supabase';

// GET /api/genres - List all genres with book counts
export async function GET() {
    try {
        // Simple query first - just get genres
        const { data: genresData, error } = await supabase
            .from('genres')
            .select('id, name, description, coverImage');

        if (error) {
            console.error('Database error:', error);
            throw new Error('Failed to fetch genres from database');
        }

        // Get book counts in a separate query
        const { data: bookCounts, error: countError } = await supabase
            .from('book_genres')
            .select('genre_id, count')
            .group_by('genre_id');

        if (countError) {
            console.error('Count error:', countError);
            throw new Error('Failed to fetch book counts');
        }

        // Combine the data
        const genresWithCounts = genresData.map(genre => ({
            id: genre.id,
            name: genre.name,
            description: genre.description,
            coverImage: genre.coverImage,
            bookCount: bookCounts.find(count => count.genre_id === genre.id)?.count || 0
        }));

        return new Response(JSON.stringify(genresWithCounts), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Error in genres endpoint:', error);
        return new Response(JSON.stringify({ 
            error: error.message || 'Failed to fetch genres'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
