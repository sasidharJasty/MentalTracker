import React from 'react';
import JouranlEditor from '../components/JournalEditor.jsx';
import EntryHistory from '../components/EntryHistory.jsx';


export default function Home() {
    return(
    <div className='bg-paper-pattern min-h-screen text-stone-800 p-6 md:p-12'>
        <div className='max-w-4xl mx-auto'>
            <h1 className='text-3xl font-bold mb-6'>My Journal</h1>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='bg-white p-6 rounded-lg shadow-md'>
                    <JouranlEditor />
                </div>
                <div className='bg-white p-6 rounded-lg shadow-md'>
                    <EntryHistory />
                </div>
            </div>
        </div>

    </div>
)
}