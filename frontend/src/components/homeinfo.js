import React from 'react';
import Hero from './hero';
import Teaminfo from './teaminfo';
import Memories from './Memories';

export default function Homeinfo() {
    return (
        <div>
            <Hero />
            <Memories />
            <Teaminfo />
        </div>
    );
}
