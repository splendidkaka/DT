// types/music.ts
export interface Song {
    id: string
    title: string
    duration: number
    url: string
    cover: string
    albumId: string
    lyrics?: LyricLine[]
}

export interface Album {
    id: string
    name: string
    year: number
    cover: string
    description: string
    songs: Song[]
}

interface LyricLine {
    time: number
    text: string
}