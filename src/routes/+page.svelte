<main class="flex flex-col items-center gap-8 px-100 m-8">
    <div class="flex flex-col justify-center items-center gap-8 bg-linear-to-b from-cyan-50 to-blue-50 rounded-2xl p-8 w-full">
        <h1 class="text-4xl font-bold">Find Your <span class="text-blue-500">Next Train</span></h1>
        <p class="text-gray-600">Real-time schedules and route information at your fingertips.</p>
        <input type="text" class="input w-120" placeholder="Search for a line... (e.g. Red Express)" />
    </div>

    <div class="flex flex-col gap-2 w-full">
        <div class="flex flex-row items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="m600-120-240-84-186 72q-20 8-37-4.5T120-170v-560q0-13 7.5-23t20.5-15l212-72 240 84 186-72q20-8 37 4.5t17 33.5v560q0 13-7.5 23T812-192l-212 72Zm-40-98v-468l-160-56v468l160 56Zm80 0 120-40v-474l-120 46v468Zm-440-10 120-46v-468l-120 40v474Zm440-458v468-468Zm-320-56v468-468Z"/></svg>
            <h2 class="text-2xl font-bold">Live Network Map</h2>
        </div>
        <div class="bg-gray-100 rounded-2xl w-full border border-gray-300 h-150">
            <p class="text-gray-600 text-center p-8">Live Network Map loading...</p>
        </div>
    </div>

    <div class="flex flex-col gap-2 w-full">
        <div class="flex flex-row items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M360-120q-66 0-113-47t-47-113v-327q-35-13-57.5-43.5T120-720q0-50 35-85t85-35q50 0 85 35t35 85q0 39-22.5 69.5T280-607v327q0 33 23.5 56.5T360-200q33 0 56.5-23.5T440-280v-400q0-66 47-113t113-47q66 0 113 47t47 113v327q35 13 57.5 43.5T840-240q0 50-35 85t-85 35q-50 0-85-35t-35-85q0-39 22.5-70t57.5-43v-327q0-33-23.5-56.5T600-760q-33 0-56.5 23.5T520-680v400q0 66-47 113t-113 47ZM240-680q17 0 28.5-11.5T280-720q0-17-11.5-28.5T240-760q-17 0-28.5 11.5T200-720q0 17 11.5 28.5T240-680Zm480 480q17 0 28.5-11.5T760-240q0-17-11.5-28.5T720-280q-17 0-28.5 11.5T680-240q0 17 11.5 28.5T720-200ZM240-720Zm480 480Z"/></svg>
            <h2 class="text-2xl font-bold">All Routes</h2>
        </div>
        <div class="flex flex-col gap-1 border border-l-red-400 border-l-4 border-r-0 border-t-0 border-b-0 bg-linear-to-r from-red-50 to-white rounded-2xl w-full h-50 p-8">
            <h2 class="text-2xl font-bold">Routes are loading...</h2>
            <div class="skeleton h-4 w-full"></div>
            <div class="skeleton h-4 w-full"></div>
            <div class="skeleton h-4 w-[75%]"></div>
        </div>
    </div>
</main>