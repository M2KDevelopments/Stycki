import React, { useEffect, useState } from 'react'

function AnimatedSticked() {

    const [notes, setNotes] = useState([]);
 
    useEffect(() => {
        const count = 8 + parseInt(Math.random() * 10);
        const width = document.documentElement.clientWidth;
        const list = []
        for (let i = 0; i < count; i++) {
            const left = parseInt(100 * Math.random()) > 50 ? true : false;
            const x = left ? parseInt(Math.random() * width * 0.2) : ((width * 0.7) + parseInt(Math.random() * width * 0.2));
            const y = parseInt(Math.random() * document.documentElement.clientHeight * 2.5);
            const colors = ["red", "orange", "yellow", "yellow", "green", "cyan", "blue", "violet", "magenta", "pink", "purple", "slate", "black"]
            const color = colors[parseInt(Math.random() * colors.length)];
            const rotation = parseInt(Math.random() * 70);
            const rotate = parseInt(100 * Math.random()) > 50 ? -rotation : rotation;
            list.push({ x, y, color, rotate });
        }
        setNotes(list);
    }, []);


    return (
        <div>
            {
                notes.map((note, index) =>
                    <div key={index} style={{ top: note.y, left: note.x, transform: `rotate(${note.rotate}deg)` }} className={`w-[300px] h-96 drop-shadow-md rounded-xl fixed opacity-25`}>
                        <div style={{ background: note.color, color: "#AAAAAA00" }} className={`h-[50px] w-full px-2 text-2xl p-3`}>
                            What You Will Get!
                        </div>
                        <div style={{ background: note.color, color: "#AAAAAA00" }} className={`p-4 opacity-20`}>
                            Welcome to Sticky Notes Pro, your ultimate solution for enhancing your web browsing experience.
                        </div>
                    </div>
                )
            }

        </div>
    )
}

export default AnimatedSticked
