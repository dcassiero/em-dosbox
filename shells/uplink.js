<!doctype html>
<html lang="en-us">
  <head>
  <!-- Global site tag (gtag.js) - Google Analytics -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=UA-10418646-6"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'UA-10418646-6');
    </script>
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="stylesheet" href="assets/css/main.css" />
    <title>Emscripten DOSBox</title>
    <style>
      .emscripten { padding-right: 0; margin-left: auto; margin-right: auto; display: block; }
      textarea.emscripten { font-family: monospace; width: 80%; }
      div.emscripten { text-align: center; }
      div.emscripten_border { border: 1px solid black; }
      /* the canvas *must not* have any border or padding, or mouse coords will be wrong */
      canvas.emscripten { border: 0px none; background-color: black; }

      .spinner {
        height: 50px;
        width: 50px;
        margin: 0px auto;
        -webkit-animation: rotation .8s linear infinite;
        -moz-animation: rotation .8s linear infinite;
        -o-animation: rotation .8s linear infinite;
        animation: rotation 0.8s linear infinite;
        border-left: 10px solid rgb(0,150,240);
        border-right: 10px solid rgb(0,150,240);
        border-bottom: 10px solid rgb(0,150,240);
        border-top: 10px solid rgb(100,0,200);
        border-radius: 100%;
        background-color: rgb(200,100,250);
      }
      @-webkit-keyframes rotation {
        from {-webkit-transform: rotate(0deg);}
        to {-webkit-transform: rotate(360deg);}
      }
      @-moz-keyframes rotation {
        from {-moz-transform: rotate(0deg);}
        to {-moz-transform: rotate(360deg);}
      }
      @-o-keyframes rotation {
        from {-o-transform: rotate(0deg);}
        to {-o-transform: rotate(360deg);}
      }
      @keyframes rotation {
        from {transform: rotate(0deg);}
        to {transform: rotate(360deg);}
      }

    </style>      
  </head>
  <body>

		<!-- Header -->
    <header id="header" class="preview">
      <div class="inner">
        <div class="content">
          <h1>#</h1>
          <h2>#</h2>
        </div>
        <a href="https://uplink.liretro.com/uplink-pc-freeplay/" class="button hidden"><span>Let's Go</span></a>
      </div>
    </header>

    <figure style="overflow:visible;" id="spinner"><div class="spinner"></div></figure>
    <div class="emscripten" id="status">Downloading...</div>
    <div class="emscripten">
      <progress value="0" max="100" id="progress" hidden=1></progress>
    </div>
    <div class="emscripten_border">
      <canvas class="emscripten" id="canvas" oncontextmenu="event.preventDefault()" tabindex=-1></canvas>
    </div>
	
 <script type='text/javascript'>
    var d = document.createElement('div');
    d.innerHTML = '<a href="../manuals/' + window.location.pathname.split('/')[1] + '.html" class="button big alt" title="Instructions">Instructions</a>';
    d.style = 'text-align:center';
    document.body.appendChild(d);
  </script>
	
    <script type='text/javascript'>
      var statusElement = document.getElementById('status');
      var progressElement = document.getElementById('progress');
      var spinnerElement = document.getElementById('spinner');

      var Module = {
        preRun: [],
        postRun: [],
        print: (function() {
          var element = document.getElementById('output');
          if (element) element.value = ''; // clear browser cache
          return function(text) {
            if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');
            // These replacements are necessary if you render to raw HTML
            //text = text.replace(/&/g, "&amp;");
            //text = text.replace(/</g, "&lt;");
            //text = text.replace(/>/g, "&gt;");
            //text = text.replace('\n', '<br>', 'g');
            console.log(text);
            if (element) {
              element.value += text + "\n";
              element.scrollTop = element.scrollHeight; // focus on bottom
            }
          };
        })(),
        printErr: function(text) {
          if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');
          console.error(text);
        },
        canvas: (function() {
          var canvas = document.getElementById('canvas');

          // As a default initial behavior, pop up an alert when webgl context is lost. To make your
          // application robust, you may want to override this behavior before shipping!
          // See http://www.khronos.org/registry/webgl/specs/latest/1.0/#5.15.2
          canvas.addEventListener("webglcontextlost", function(e) { alert('WebGL context lost. You will need to reload the page.'); e.preventDefault(); }, false);

          return canvas;
        })(),
        setStatus: function(text) {
          if (!Module.setStatus.last) Module.setStatus.last = { time: Date.now(), text: '' };
          if (text === Module.setStatus.last.text) return;
          var m = text.match(/([^(]+)\((\d+(\.\d+)?)\/(\d+)\)/);
          var now = Date.now();
          if (m && now - Module.setStatus.last.time < 30) return; // if this is a progress update, skip it if too soon
          Module.setStatus.last.time = now;
          Module.setStatus.last.text = text;
          if (m) {
            text = m[1];
            progressElement.value = parseInt(m[2])*100;
            progressElement.max = parseInt(m[4])*100;
            progressElement.hidden = false;
            spinnerElement.hidden = false;
          } else {
            progressElement.value = null;
            progressElement.max = null;
            progressElement.hidden = true;
            if (!text) spinnerElement.hidden = true;
          }
          statusElement.innerHTML = text;
        },
        totalDependencies: 0,
        monitorRunDependencies: function(left) {
          this.totalDependencies = Math.max(this.totalDependencies, left);
          Module.setStatus(left ? 'Preparing... (' + (this.totalDependencies-left) + '/' + this.totalDependencies + ')' : 'All downloads complete.');
        }
      };
      Module.setStatus('Downloading...');
      window.onerror = function() {
        Module.setStatus('Exception thrown, see JavaScript console');
        spinnerElement.style.display = 'none';
        Module.setStatus = function(text) {
          if (text) Module.printErr('[post-exception status] ' + text);
        };
      };
    </script>
    {{{ SCRIPT }}}





		<!-- Footer -->
    <footer id="footer">
      <a href="#" class="info fa fa-info-circle"><span>About</span></a>
      <div class="inner">
        <div class="content">
          <h3>UPLINK by Long Island Retro Gaming</h3>
          <p>Welcome to one of our DOS game offerings. Simply use your keyboard and mouse to play the game. Most games only require the keyboard. Please go to: channel if you experience any problems or need help. Enjoy!</p>
        </div>
        <div class="copyright">
          <h3>Follow us!</h3>
          <ul class="icons">
            <li><a href="https://twitter.com/liretro" class="icon fa-twitter"><span class="label">Twitter</span></a></li>
            <li><a href="https://www.facebook.com/liretrogamingexpo/" class="icon fa-facebook"><span class="label">Facebook</span></a></li>
            <li><a href="https://www.instagram.com/liretro/" class="icon fa-instagram"><span class="label">Instagram</span></a></li>
          </ul>
          &copy; Long Island Retro Gaming LLC. Design: <a href="https://templated.co">TEMPLATED</a>.
        </div>
      </div>
    </footer>

  <!-- Scripts -->
    <script src="assets/js/jquery.min.js"></script>
    <script src="assets/js/skel.min.js"></script>
    <script src="assets/js/util.js"></script>
    <script src="assets/js/main.js"></script>


  </body>
</html>
