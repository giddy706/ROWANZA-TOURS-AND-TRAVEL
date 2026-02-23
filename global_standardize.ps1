
$pages = @('index.html', 'destinations.html', 'tours.html', 'about-us.html', 'gallery.html', 'blogs.html', 'contact-us.html', 'tours-details-style-01.html', 'tours-details-style-02.html', 'checkout.html', 'cart.html')

foreach ($page in $pages) {
    $path = "c:\My Web Sites\Tours and travel\$page"
    if (-not (Test-Path $path)) { continue }
    
    $content = Get-Content $path -Raw
    
    # Pre-calculate active classes
    $homeActive = if ($page -eq 'index.html') { 'text-green-zomp' } else { '' }
    $destActive = if ($page -eq 'destinations.html') { 'text-green-zomp' } else { '' }
    $toursActive = if ($page -eq 'tours.html') { 'text-green-zomp' } else { '' }
    $aboutActive = if ($page -eq 'about-us.html') { 'text-green-zomp' } else { '' }
    $galleryActive = if ($page -eq 'gallery.html') { 'text-green-zomp' } else { '' }
    $blogActive = if ($page -eq 'blogs.html') { 'text-green-zomp' } else { '' }
    $contactActive = if ($page -eq 'contact-us.html') { 'text-green-zomp' } else { '' }

    $headerReplacement = @"
<header class="w-full bg-white">
        <div class="container flex items-center justify-between py-4 mx-auto">
            <div class="menu-toggle cursor-pointer block lg:hidden">
                <span class="iconify" data-icon="fe:bar" data-width="24" data-height="24"></span>
            </div>
            <div class="header-logo flex items-center gap-2">
                <a href="index.html">
                    <img src="assets/images/logo.png" alt="Logo" class="w-auto h-10">
                </a>
            </div>
            <nav class="header-menu mx-8 relative">
                <div class="close-menu-toggle lg:hidden absolute top-2.5 right-2.5">
                    <span class="iconify" data-icon="ic:sharp-clear" data-width="22" data-height="22"></span>
                </div>
                <ul class="flex justify-center lg:gap-4 xl:gap-10 text-base font-semibold text-black">
                    <li><a href="index.html" class="$homeActive transition-all duration-200 hover:text-green-zomp">Home</a></li>
                    <li><a href="destinations.html" class="$destActive transition-all duration-200 hover:text-green-zomp text-black">Destinations</a></li>
                    <li><a href="tours.html" class="$toursActive transition-all duration-200 hover:text-green-zomp text-black">Tour Packages</a></li>
                    <li><a href="about-us.html" class="$aboutActive transition-all duration-200 hover:text-green-zomp text-black">About Us</a></li>
                    <li><a href="gallery.html" class="$galleryActive transition-all duration-200 hover:text-green-zomp text-black">Gallery</a></li>
                    <li><a href="blogs.html" class="$blogActive transition-all duration-200 hover:text-green-zomp text-black">Blog</a></li>
                    <li><a href="contact-us.html" class="$contactActive transition-all duration-200 hover:text-green-zomp text-black">Contact</a></li>
                </ul>
            </nav>

            <div class="flex items-center gap-6">
                <div class="hidden sm:flex items-center gap-4">
                     <a href="tel:0717446976" class="flex items-center gap-2 font-bold text-black border border-stroke p-2 rounded-lg hover:bg-green-light transition duration-200">
                        <span class="iconify text-green-zomp" data-icon="ph:phone-call-bold"></span> 0717446976
                     </a>
                </div>
                <a href="contact-us.html" class="text-white text-base font-semibold py-2.5 px-6 bg-green-zomp rounded-[200px] transition duration-200 hover:bg-green-zomp-hover shadow-md">Book Now</a>
            </div>
        </div>
    </header>
"@

    $footerReplacement = @'
<footer class="bg-darker-grey text-white overflow-hidden pt-16">
        <div class="container pb-12">
            <div class="flex flex-wrap md:flex-nowrap justify-between gap-10">
                <div class="w-full md:w-[35%]">
                    <img src="assets/images/logo-footer.png" alt="Logo" class="h-[50px] w-auto mb-7" />
                    <p class="text-white-grey font-medium mb-10 italic">Luxury Safaris, Beach Escapes & Custom Adventures Across Kenya and Africa.</p>
                    <ul class="space-y-4 text-grey">
                        <li class="flex items-start gap-2">
                            <span class="iconify mt-1" data-icon="ep:location" data-width="20" data-height="20"></span>
                            <p>Rowanza Plaza, Nairobi, Kenya</p>
                        </li>
                        <li class="flex items-center gap-2">
                            <span class="iconify" data-icon="ph:phone-call" data-width="20" data-height="20"></span>
                            <p>0717446976</p>
                        </li>
                        <li class="flex items-center gap-2">
                            <span class="iconify" data-icon="ic:baseline-whatsapp" data-width="20" data-height="20" style="color: #25D366;"></span>
                            <p>+254 717 446 976</p>
                        </li>
                    </ul>
                </div>

                <div class="w-1/2 md:w-1/5">
                    <h6 class="text-white font-bold mb-6 text-xl">Top Destinations</h6>
                    <ul class="space-y-4 text-grey">
                        <li><a href="tours.html?category=kenya" class="hover:text-green-zomp transition">🇰🇪 Kenya Safaris</a></li>
                        <li><a href="tours.html?category=africa" class="hover:text-green-zomp transition">🌍 Africa Tours</a></li>
                        <li><a href="tours.html?tripType=Beach" class="hover:text-green-zomp transition">🏖 Beach Holidays</a></li>
                        <li><a href="tours.html?tripType=Adventure" class="hover:text-green-zomp transition">🧗 Adventure Trips</a></li>
                    </ul>
                </div>

                <div class="w-1/2 md:w-1/5">
                    <h6 class="text-white font-bold mb-6 text-xl">Quick Links</h6>
                    <ul class="space-y-4 text-grey">
                        <li><a href="about-us.html" class="hover:text-green-zomp transition">About Us</a></li>
                        <li><a href="blogs.html" class="hover:text-green-zomp transition">Travel Blog</a></li>
                        <li><a href="gallery.html" class="hover:text-green-zomp transition">Our Gallery</a></li>
                        <li><a href="contact-us.html" class="hover:text-green-zomp transition">Contact Us</a></li>
                        <li><a href="admin.html" class="hover:text-green-zomp transition text-orange-yellow">Admin Dashboard</a></li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="border-t border-dark-grey py-6 bg-black text-center text-grey">
            <p>Copyright © 2026 Rowanza Tours and Travels. All Rights Reserved.</p>
        </div>
    </footer>
'@

    # Header Replacement
    $headerRegex = '(?s)<header.*?</header>'
    if ($page -eq 'blogs.html' -and $content -match '<header id="main-header"></header>') {
        $headerRegex = '(?s)<header id="main-header"></header>'
    }
    $content = $content -replace $headerRegex, $headerReplacement

    # Footer Replacement
    $footerRegex = '(?s)<footer.*?</footer>'
    if ($page -eq 'blogs.html' -and $content -match '<footer id="main-footer"></footer>') {
        $footerRegex = '(?s)<footer id="main-footer"></footer>'
    }
    $content = $content -replace $footerRegex, $footerReplacement

    # Save back
    [System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)
}

Write-Host "Global standardization complete for all 7 pages."
