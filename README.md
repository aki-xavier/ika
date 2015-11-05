ika
============
It's time to say goodbye to current, and further browser compatibility problem.

###Getting started

I use `component` as the client package manager.

    component install
    component build
    
Make sure you have `component` installed; excute commands above, and you will get a /build/build.js, then go checkout /examples.

for more information about component, see [https://github.com/component/component](https://github.com/component/component)

###Goals
There are so many browsers anf platforms right now, which is a disaster for developers.

Most of our time had been wasted on writing browser tricks or detecting different browser apis. In fact, nowdays, one can hardly write cross-browser pages without the help of frameworks like jQuery. HTML5 and CSS3 have been there for a while, but still isn't widely used, mostly because of browser compatibility problem.

Want to write apps for all platforms? think about all those languages you have to learn: Objective-C, Java, C++, etc. It's mission impossible for individual developers, and not easy even for big companies. Aditionally, There are more platforms on the way.

But, on the mobile side, DOM animation runs slow and looks ugly; on the desktop, lots of actions like drag & drop just don't work, I want something that looks amazing, runs extremely fast, and works on PC, Mac, iOS, android, all platforms. So I started this project.

I choose to build everything on the canvas tag, let's give up older browsers and start fresh from IE9+, all I need from the browser rendering engine are stable canvas api and fast canvas implementation.

This sets of components renders much faster than DOM, people may wonder how could js beats c++ in speed, actually it can't, but we can do more performance optimization when js has the access to core rendering process, like render-on-demand, partial render, render result cache. And will be even faster if you choose runtimes like [Ejecta](https://github.com/phoboslab/Ejecta) rather than webkit.


###Features
* don't need to write extra code for mouse/touch events adapting desktop and mobile env
* bring iOS-like experience to desktop: drag and drop, scroll, etc
* has a screen recorder and a monkey test tool for debugging
* do whatever 2-D matrix transform to all components, while all user interactions still works in transformed cordinate
* expand classes however you like unlimitedly
* partial render, improve performance greatly rendering a very long list
* has the ability to parse XML documents into scenegraph, simplifing element creations