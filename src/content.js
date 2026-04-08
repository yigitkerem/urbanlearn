// content.js
const isVanilla = localStorage.getItem('urbanlearn-enabled') === 'false';

if (!isVanilla && localStorage.getItem('urbanlearn-theme') === 'light') {
    document.documentElement.classList.add('light-theme');
}

const injectFloatingButtons = (vanillaMode) => {
    if (document.getElementById('urbanlearn-floating-container')) return;
    
    const container = document.createElement('div');
    container.id = 'urbanlearn-floating-container';
    container.className = 'd-flex flex-column gap-3';
    container.style.position = 'fixed';
    container.style.bottom = '2rem';
    container.style.right = '2rem';
    container.style.zIndex = '9999';
    
    const vanillaToggle = document.createElement('button');
    vanillaToggle.className = 'btn rounded-circle shadow-lg d-flex align-items-center justify-content-center';
    vanillaToggle.style.width = '60px';
    vanillaToggle.style.height = '60px';
    vanillaToggle.style.background = vanillaMode ? '#1a1b22' : 'var(--accent-bg)';
    vanillaToggle.style.color = vanillaMode ? '#e6e6e6' : 'var(--accent-text)';
    vanillaToggle.style.border = vanillaMode ? '1px solid rgba(255,255,255,0.2)' : 'none';
    vanillaToggle.style.transition = 'all 0.3s ease';
    vanillaToggle.innerHTML = vanillaMode ? '<i class="fa fa-magic fs-4"></i>' : '<i class="fa fa-code fs-4"></i>';
    vanillaToggle.title = vanillaMode ? 'Enable UrbanLearn Theme' : 'Revert to Vanilla PrairieLearn';
    
    vanillaToggle.onclick = () => {
        localStorage.setItem('urbanlearn-enabled', vanillaMode ? 'true' : 'false');
        location.reload();
    };
    
    container.appendChild(vanillaToggle);
    
    if (!vanillaMode) {
        const themeToggle = document.createElement('button');
        themeToggle.className = 'btn rounded-circle shadow-lg d-flex align-items-center justify-content-center';
        themeToggle.style.width = '60px';
        themeToggle.style.height = '60px';
        themeToggle.style.background = 'var(--accent-bg)';
        themeToggle.style.color = 'var(--accent-text)';
        themeToggle.style.border = 'none';
        themeToggle.style.transition = 'all 0.3s ease';
        
        const updateIcon = () => {
          themeToggle.innerHTML = document.documentElement.classList.contains('light-theme') 
            ? '<i class="fa fa-moon" style="font-size: 1.5rem"></i>' 
            : '<i class="fa fa-sun" style="font-size: 1.5rem"></i>';
        };
        
        themeToggle.onclick = () => {
            document.documentElement.classList.toggle('light-theme');
            localStorage.setItem('urbanlearn-theme', document.documentElement.classList.contains('light-theme') ? 'light' : 'dark');
            updateIcon();
        };
        updateIcon();
        container.appendChild(themeToggle);
    }
    
    document.body.appendChild(container);
};

if (isVanilla) {
    document.addEventListener("DOMContentLoaded", () => {
        injectFloatingButtons(true);
    });
} else {

    // Dynamically inject the CSS early since it's no longer in manifest
    const injectCSS = () => {
        if (!document.head) {
             setTimeout(injectCSS, 5);
             return;
        }
        if (!document.querySelector('link[data-urban-theme]')) {
             const styleLink = document.createElement('link');
             styleLink.rel = 'stylesheet';
             styleLink.href = chrome.runtime.getURL('styles.css');
             styleLink.setAttribute('data-urban-theme', 'true');
             document.head.appendChild(styleLink);
        }
    };
    injectCSS();

document.addEventListener("DOMContentLoaded", () => {
  // Sometimes Bootstrap dynamically overrides things or PL inserts empty containers.
  // We can wrap the main question content or strip specific inline styles.
  
  const cleanStyles = () => {
    // Strip background colors and text colors that are hard-coded inline
    document.querySelectorAll('[style]').forEach(el => {
      if (el.style.backgroundColor === "white" || el.style.backgroundColor === "#fff" || el.style.backgroundColor === "rgb(255, 255, 255)") {
        el.style.backgroundColor = 'transparent';
      }
      if (el.style.color === "black" || el.style.color === "#000" || el.style.color === "rgb(0, 0, 0)") {
        el.style.color = '';
      }
    });

    // Strip text-dark classes that force black text
    document.querySelectorAll('.text-dark').forEach(el => {
      // Don't strip if it is our custom 'text-dark' added to 'question-grade'
      if (!el.classList.contains('question-grade')) {
        el.classList.remove('text-dark');
      }
    });
  };

  const modernizeLayout = () => {
    // 0. UrbanLearn Rebranding
    if (document.title.includes('PrairieLearn')) {
        document.title = document.title.replace('PrairieLearn', 'UrbanLearn');
    }
    document.querySelectorAll('.navbar-brand-label').forEach(el => {
       if (el.textContent.includes('PrairieLearn')) {
          el.textContent = 'UrbanLearn';
       }
    });
    
    // 1. Annihilate Personal Notes
    const attachNotes = document.getElementById('attach-file-panel');
    if (attachNotes) attachNotes.remove();

    // 2. Assessment Name & Overview to Top bar
    const assessmentNameA = document.querySelector('#assessment-score-panel .card-header a');
    const overviewBtn = document.querySelector('#assessment-score-panel a.btn-info');
    const mainNav = document.getElementById('main-nav');
    
    // Wipe main-nav links and course name
    if (mainNav) mainNav.innerHTML = '';

    if (assessmentNameA) {
      const centerTitle = document.createElement('div');
      centerTitle.className = 'position-absolute start-50 translate-middle-x d-flex align-items-center gap-3 z-3';
      
      const nameClone = assessmentNameA.cloneNode(true);
      nameClone.className = 'fw-bold text-white mb-0 text-decoration-none fs-5';
      centerTitle.appendChild(nameClone);
      
      if (overviewBtn) {
        const btnClone = overviewBtn.cloneNode(true);
        btnClone.className = 'btn btn-sm text-white rounded-pill px-3';
        btnClone.style.border = '1px solid rgba(255,255,255,0.4)';
        btnClone.style.background = 'transparent';
        btnClone.textContent = 'Overview';
        centerTitle.appendChild(btnClone);
      }
      
      const containerFluid = document.querySelector('.navbar > .container-fluid');
      if (containerFluid) {
        containerFluid.classList.add('position-relative');
        containerFluid.appendChild(centerTitle);
      }
    }

    // 3. Extract Attempts to Pill
    const scorePanel = document.getElementById('question-score-panel');
    let pillContainer = null;
    if (scorePanel) {
      const badges = Array.from(scorePanel.querySelectorAll('a.badge'));
      if (badges.length > 0) {
        pillContainer = document.createElement('div');
        pillContainer.className = 'attempts-pill-container d-flex flex-wrap gap-2 justify-content-center mb-4';
        const label = document.createElement('span');
        label.textContent = 'Attempts:';
        label.className = 'text-white me-2 align-self-center fw-bold';
        pillContainer.appendChild(label);

        badges.forEach(b => {
          const isActive = b.classList.contains('text-bg-info') || b.classList.contains('badge-info');
          b.className = 'attempt-badge';
          if (isActive) {
             b.classList.add('active');
          }
          const hidden = b.querySelector('.visually-hidden');
          if (hidden) hidden.remove();

          pillContainer.appendChild(b);
        });
      }
      scorePanel.remove(); // Burn the rest
    }
    
    // Remove the whole assessment panel now that we extracted what we need
    const assessmentBlock = document.getElementById('assessment-score-panel');
    if (assessmentBlock) assessmentBlock.remove();

    // 4. Move Prev/Next to bottom integrated with Save/Submit
    const prevBtn = document.getElementById('question-nav-prev');
    const nextBtn = document.getElementById('question-nav-next');
    
    // remove the wrapper that held them initially
    const navTextCenter = document.querySelector('.text-center.mb-2');
    if (navTextCenter && (navTextCenter.contains(prevBtn) || navTextCenter.contains(nextBtn))) {
       navTextCenter.remove();
    }

    // Find the save buttons container directly inside the form
    const footerInner = document.querySelector('#question-panel-footer-content > .row > .col');
    if (footerInner) {
       const hiddenInputs = Array.from(footerInner.querySelectorAll('input[type="hidden"]'));
       const actionElements = Array.from(footerInner.querySelectorAll('a.btn, button.btn')).filter(btn => {
           return !btn.classList.contains('btn-ghost'); // ignore info popovers
       });
       
       footerInner.className = 'col d-flex justify-content-between align-items-center flex-row w-100 gap-3 mt-4 px-0';
       footerInner.innerHTML = ''; 

       hiddenInputs.forEach(inp => footerInner.appendChild(inp)); // preserve hidden variables

       if (prevBtn) {
           prevBtn.innerHTML = '<i class="fa fa-chevron-left" aria-hidden="true" style="font-size: 1.2rem;"></i>';
           prevBtn.className = 'btn text-white rounded-circle d-flex align-items-center justify-content-center question-nav-btn';
           footerInner.appendChild(prevBtn);
       } else {
           const spacer = document.createElement('div');
           spacer.className = 'question-nav-btn invisible';
           footerInner.appendChild(spacer);
       }

       const centerActions = document.createElement('div');
       centerActions.className = 'd-flex align-items-center gap-3';
       
       actionElements.forEach(btn => {
           const small = btn.querySelector('small');
           if (small) small.remove(); // strip subtext
           
           if (btn.classList.contains('question-grade') || btn.textContent.toLowerCase().includes('variant')) {
               btn.className = 'btn rounded-pill px-4 py-2 fw-bold question-grade urban-btn-primary';
            } else {
               btn.className = 'btn rounded-pill px-4 py-2 fw-bold question-save urban-btn-secondary';
            }
            centerActions.appendChild(btn);
       });
       
       footerInner.appendChild(centerActions);

       if (nextBtn) {
           nextBtn.innerHTML = '<i class="fa fa-chevron-right" aria-hidden="true" style="font-size: 1.2rem;"></i>';
           nextBtn.className = 'btn text-white rounded-circle d-flex align-items-center justify-content-center question-nav-btn';
           footerInner.appendChild(nextBtn);
       } else {
           const spacer = document.createElement('div');
           spacer.className = 'question-nav-btn invisible';
           footerInner.appendChild(spacer);
       }
    }

    // 5. Restructure Columns
    const rightCol = document.querySelector('.col-lg-3.col-sm-12');
    if (rightCol) rightCol.remove();
    
    const leftCol = document.querySelector('.col-lg-9.col-sm-12');
    if (leftCol) {
      leftCol.className = 'col-12 d-flex flex-column w-100 px-0 mx-auto';
      leftCol.style.maxWidth = '1000px';
    }

    // 6. Clean All Card Containers
    const cardBlocks = document.querySelectorAll('.question-block, .grading-block, [data-testid="submission-block"], .submission-block');
    cardBlocks.forEach(block => {
       const header = block.querySelector('.card-header');
       let hNode = header ? header.querySelector('h1, h2, h3, h4, h5, h6') : null;
       
       if (hNode && header) {
         hNode.className = 'mb-1 mt-0 fs-3 fw-bold text-center w-100 text-white';
         
         const wrapper = document.createElement('div');
         wrapper.className = 'w-100 d-flex flex-column align-items-center mb-3 mt-4';
         wrapper.appendChild(hNode);
         
         if (block.classList.contains('question-block') && pillContainer) {
            wrapper.appendChild(pillContainer);
         }
         
         if (block.classList.contains('question-block')) {
            block.parentNode.insertBefore(wrapper, block);
         } else {
            wrapper.classList.remove('mt-4'); // no extra top margin needed inside card
            block.insertBefore(wrapper, block.firstChild);
         }
         header.remove();
       } else if (block.classList.contains('question-block') && pillContainer) {
         const wrapper = document.createElement('div');
         wrapper.className = 'w-100 d-flex flex-column align-items-center mb-3 mt-4';
         wrapper.appendChild(pillContainer);
         block.parentNode.insertBefore(wrapper, block);
       }
    });

    // 7. Detach Footer
    const qFooter = document.getElementById('question-panel-footer');
    const qBlock = document.querySelector('.question-block');
    if (qFooter && qBlock) {
       qBlock.parentNode.insertBefore(qFooter, qBlock.nextSibling);
       qFooter.style.padding = '0';
       qFooter.style.marginTop = '1rem';
    }
    // 8. Overhaul Assessment Overview Table
    const assessmentTable = document.querySelector('table[data-testid="assessment-questions"]');
    if (assessmentTable) {
        const mainCard = assessmentTable.closest('.card');
        if (mainCard) {
            mainCard.style.background = 'transparent';
            mainCard.style.border = 'none';
            mainCard.style.boxShadow = 'none';
            const mcHeader = mainCard.querySelector('.card-header');
            if (mcHeader) {
                const headerH1 = mcHeader.querySelector('h1, h2, h3');
                if (headerH1) {
                   headerH1.className = 'fs-2 fw-bold text-white mb-4 mt-2';
                   mainCard.insertBefore(headerH1, mainCard.firstChild);
                }
                mcHeader.remove();
            }
            
            const cardBody = mainCard.querySelector('.card-body');
            if (cardBody) {
                const alignRow = cardBody.querySelector('.row.align-items-center');
                if (alignRow) {
                    alignRow.className = 'd-flex justify-content-between align-items-center gap-4 p-4 rounded-4 mb-4';
                    alignRow.style.background = 'var(--bg-secondary)';
                    alignRow.style.border = '1px solid rgba(255,255,255,0.08)';

                    const cols = Array.from(alignRow.children);
                    if (cols.length >= 3) {
                       const ptsCol = cols[0];
                       const progCol = cols[1];
                       const statusCol = cols[2];
                       
                       ptsCol.className = 'd-flex flex-column gap-1';
                       ptsCol.style.flex = '0 0 auto';
                       const originalText = ptsCol.textContent.trim().replace(/\s+/g, ' ');
                       const ptsMatch = originalText.match(/Total points:\s*(.+)/i);
                       ptsCol.innerHTML = `<span class="text-uppercase fw-bold" style="color: #a0a4b0; font-size: 0.65rem; letter-spacing: 1px;">Overview</span><span class="fs-4 fw-bold text-white">${ptsMatch ? ptsMatch[1] : originalText} Points</span>`;
                       
                       progCol.className = 'flex-grow-1 px-4';
                       const progBar = progCol.querySelector('.progress');
                       if (progBar) {
                           progBar.className = 'progress w-100 rounded-pill overflow-hidden';
                           progBar.style.height = '8px';
                           progBar.style.background = 'rgba(255,255,255,0.05)';
                           progBar.style.border = 'none';
                           const innerBar = progBar.querySelector('.progress-bar');
                           if (innerBar) {
                                 innerBar.className = 'progress-bar';
                                 innerBar.style.background = '#4CAF50';
                                 innerBar.style.boxShadow = '0 0 10px rgba(76,175,80,0.5)';
                                 innerBar.textContent = '';
                           }
                       }
                       
                       statusCol.className = 'text-end d-flex flex-column align-items-end justify-content-center';
                       statusCol.style.flex = '0 0 auto';
                       const popoverBtn = statusCol.querySelector('button');
                       const isOpen = statusCol.textContent.toLowerCase().includes('open');
                       
                       statusCol.innerHTML = '';
                       
                       const sysPill = document.createElement('div');
                       sysPill.className = 'rounded-pill fw-bold d-inline-block text-center';
                       sysPill.style.padding = '6px 14px';
                       sysPill.style.fontSize = '0.7rem';
                       sysPill.style.letterSpacing = '0.5px';
                       if (isOpen) {
                          sysPill.style.background = 'rgba(255,255,255,0.95)';
                          sysPill.style.color = '#111'; // Bypasses MutationObserver
                          sysPill.textContent = 'OPEN FOR SUBMISSIONS';
                       } else {
                          sysPill.style.background = 'rgba(255,255,255,0.1)';
                          sysPill.style.color = '#a0a4b0';
                          sysPill.textContent = 'CLOSED';
                       }
                       statusCol.appendChild(sysPill);
                       
                       if (popoverBtn) {
                           popoverBtn.className = 'mt-2 text-decoration-none d-flex align-items-center gap-2';
                           popoverBtn.style.fontSize = '0.75rem';
                           popoverBtn.style.color = '#a0a4b0';
                           popoverBtn.style.background = 'transparent';
                           popoverBtn.style.border = 'none';
                           popoverBtn.style.cursor = 'pointer';
                           popoverBtn.innerHTML = '<i class="fa fa-clock"></i> Deadlines';
                           statusCol.appendChild(popoverBtn);
                       }
                    }
                }
            }
        }

        const tableContainer = assessmentTable.parentElement;
        if (tableContainer) {
            tableContainer.classList.remove('table-responsive');
            tableContainer.style.background = 'transparent';
        }

        const flexGrid = document.createElement('div');
        flexGrid.className = 'w-100 pb-5';
        
        let currentGridGroup = null;

        const rows = Array.from(assessmentTable.querySelectorAll('tbody tr'));
        rows.forEach(tr => {
            const th = tr.querySelector('th[colspan]');
            if (th) {
                const sectionTitle = document.createElement('h3');
                sectionTitle.className = 'text-white fw-bold fs-5 mt-5 mb-4 border-bottom pb-2';
                sectionTitle.style.borderColor = 'rgba(255,255,255,0.1)';
                sectionTitle.textContent = th.textContent.trim();
                flexGrid.appendChild(sectionTitle);
                
                currentGridGroup = document.createElement('div');
                currentGridGroup.style.display = 'flex';
                currentGridGroup.style.flexDirection = 'column';
                currentGridGroup.style.gap = '0.8rem';
                flexGrid.appendChild(currentGridGroup);
            } else {
                if (!currentGridGroup) {
                    currentGridGroup = document.createElement('div');
                    currentGridGroup.style.display = 'flex';
                    currentGridGroup.style.flexDirection = 'column';
                    currentGridGroup.style.gap = '0.8rem';
                    flexGrid.appendChild(currentGridGroup);
                }
                
                const tds = tr.querySelectorAll('td');
                if (tds.length === 0) return;
                
                const qLink = tds[0]?.querySelector('a');
                const qName = qLink ? qLink.textContent.trim() : 'Unknown';
                const qHref = qLink ? qLink.href : '#';
                
                const awardedNode = tr.querySelector('[data-testid="awarded-points"]');
                const pts = awardedNode ? parseFloat(awardedNode.textContent.trim()) || 0 : 0;
                
                let rawText = '';
                let percent = 0;
                let isFull = false;
                if (tds.length > 0) {
                   const cellText = tds[tds.length-1].textContent;
                   rawText = cellText.replace(/\//g, ' / ').replace(/\s+/g, ' ').trim(); 
                   if (rawText.length > 15) rawText = awardedNode ? awardedNode.textContent.trim() : '0';
                   
                   const match = cellText.match(/(\d+(?:\.\d+)?)[\s]*\/[\s]*(\d+(?:\.\d+)?)/);
                   if (match) {
                       const awarded = parseFloat(match[1]);
                       const total = parseFloat(match[2]);
                       if (total > 0) percent = Math.round((awarded / total) * 100);
                       if (awarded > 0 && awarded >= total) isFull = true;
                   } else if (pts > 0) {
                       percent = 100;
                       isFull = true;
                   }
                }
                
                const badges = Array.from(tds[tds.length - 2]?.querySelectorAll('.badge') || []);
                
                const card = document.createElement('a');
                card.href = qHref;
                card.className = 'urban-card-hover text-decoration-none p-4 d-flex align-items-center justify-content-between position-relative overflow-hidden';
                card.style.backgroundColor = 'var(--bg-secondary)';
                card.style.border = '1px solid var(--border-color)';
                card.style.borderRadius = '12px';
                card.style.cursor = 'pointer';
                
                const leftSide = document.createElement('div');
                leftSide.className = 'd-flex align-items-center gap-4';
                
                const title = document.createElement('div');
                title.className = 'text-white fw-bold fs-6 lh-sm';
                title.textContent = qName;
                leftSide.appendChild(title);
                
                if (badges.length > 0) {
                    const variantsRow = document.createElement('div');
                    variantsRow.className = 'd-flex gap-2 flex-wrap';
                    const badgeTokens = new Set();
                    badges.forEach(b => {
                        const vHidden = b.querySelector('.visually-hidden');
                        if (vHidden) vHidden.remove();
                        const txt = b.textContent.trim();
                        if (badgeTokens.has(txt)) return; 
                        badgeTokens.add(txt);
                        
                        const clonedBadge = document.createElement('span');
                        clonedBadge.textContent = txt;
                        clonedBadge.className = 'badge rounded-pill fw-normal px-2 py-1';
                        
                        if (b.classList.contains('text-bg-info') || txt.includes('Open')) {
                           clonedBadge.style.background = 'rgba(255, 255, 255, 0.9)';
                           clonedBadge.style.color = '#111'; // bypass mutation killer
                        } else {
                           clonedBadge.style.background = 'rgba(255,255,255,0.08)';
                           clonedBadge.style.color = '#a0a4b0';
                           clonedBadge.style.border = '1px solid rgba(255,255,255,0.05)';
                        }
                        variantsRow.appendChild(clonedBadge);
                    });
                    leftSide.appendChild(variantsRow);
                }
                
                // Right side: Score & Percentage Pill
                const rightSide = document.createElement('div');
                rightSide.className = 'd-flex align-items-center gap-3 z-3 position-relative';
                
                const scoreText = document.createElement('div');
                scoreText.className = 'fs-7 fw-bold';
                scoreText.style.color = '#d1d5db';
                scoreText.style.fontVariantNumeric = 'tabular-nums';
                scoreText.textContent = rawText;
                
                const percentBadge = document.createElement('div');
                percentBadge.className = 'badge rounded-pill fw-bold d-flex justify-content-center align-items-center';
                percentBadge.style.minWidth = '54px';
                percentBadge.style.padding = '8px 14px';
                percentBadge.style.fontSize = '0.75rem';
                percentBadge.textContent = `${percent}%`;
                
                if (isFull) {
                   percentBadge.style.background = 'var(--success-bg)';
                   percentBadge.style.color = 'var(--success-text)';
                   percentBadge.style.border = '1px solid var(--success-border)';
                } else if (percent > 0) {
                   percentBadge.style.background = 'var(--warning-bg)';
                   percentBadge.style.color = 'var(--warning-text)';
                   percentBadge.style.border = '1px solid var(--warning-border)';
                } else {
                   percentBadge.style.background = 'var(--muted-badge-bg)';
                   percentBadge.style.color = 'var(--text-secondary)';
                   percentBadge.style.border = '1px solid var(--muted-badge-border)';
                }
                
                rightSide.appendChild(scoreText);
                rightSide.appendChild(percentBadge);
                
                card.appendChild(leftSide);
                card.appendChild(rightSide);
                
                // Progress Bar at bottom
                const progressBar = document.createElement('div');
                progressBar.className = 'position-absolute bottom-0 start-0 w-100';
                progressBar.style.height = '3px';
                progressBar.style.background = 'transparent';
                
                const progressFill = document.createElement('div');
                progressFill.style.height = '100%';
                progressFill.style.width = `${percent}%`;
                if (isFull) {
                    progressFill.style.background = 'var(--progress-green)';
                    progressFill.style.boxShadow = '0 0 10px rgba(76,175,80,0.5)'; // safe for light mode visually
                } else if (percent > 0) {
                    progressFill.style.background = 'var(--progress-yellow)'; 
                } else {
                    progressFill.style.background = 'transparent';
                }
                
                progressBar.appendChild(progressFill);
                card.appendChild(progressBar);
                
                currentGridGroup.appendChild(card);
            }
        });
        
        tableContainer.innerHTML = '';
        tableContainer.appendChild(flexGrid);
    }
    
    // Extinguish footer
    const footer = document.querySelector('footer.footer');
    if (footer) footer.remove();
  };

  const overhaulCoursesGrid = () => {
    const courseTable = document.querySelector('table[aria-label="Courses"]');
    if (!courseTable || courseTable.dataset.urbanized) return;
    courseTable.dataset.urbanized = 'true';

    const cardParent = courseTable.closest('.card');
    if (cardParent) {
        cardParent.style.background = 'transparent';
        cardParent.style.border = 'none';
        cardParent.style.boxShadow = 'none';
        
        const header = cardParent.querySelector('.card-header');
        if (header) {
            const h2 = header.querySelector('h2');
            if (h2) {
                h2.className = 'fs-2 fw-bold text-white mb-4 mt-2';
                cardParent.insertBefore(h2, cardParent.firstChild);
            }
            const addBtn = header.querySelector('button');
            if (addBtn) {
                addBtn.className = 'btn rounded-pill px-4 py-2 mt-2 position-absolute end-0 top-0 fw-bold';
                addBtn.style.background = 'rgba(255,255,255,0.1)';
                addBtn.style.color = '#fff';
                addBtn.style.border = '1px solid rgba(255,255,255,0.15)';
                cardParent.style.position = 'relative';
                cardParent.appendChild(addBtn);
            }
            header.remove();
        }

        const flexGrid = document.createElement('div');
        flexGrid.className = 'd-grid gap-4 w-100 pb-5 pt-3';
        flexGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(320px, 1fr))';
        
        const content = document.getElementById('content');
        if (content) {
            content.classList.remove('container');
            content.classList.add('container-fluid');
            content.style.maxWidth = '1600px';
            content.style.paddingLeft = '3rem';
            content.style.paddingRight = '3rem';
        }
        
        const rows = Array.from(courseTable.querySelectorAll('tbody tr'));
        rows.forEach(tr => {
            const td = tr.querySelector('td.align-middle');
            if (!td) return;
            
            const link = td.querySelector('a');
            const removeBtn = td.querySelector('button');
            
            if (link) {
                const rawText = link.textContent.trim();
                const parts = rawText.split(': ');
                const code = parts[0] ? parts[0].trim() : ''; 
                const rest = parts[1] ? parts[1].split(', ') : [];
                const title = rest[0] ? rest[0].trim() : ''; 
                const term = rest[1] ? rest[1].trim() : ''; 
                
                const card = document.createElement('a');
                card.href = link.href;
                card.className = 'urban-card-hover text-decoration-none p-4 d-flex flex-column position-relative overflow-hidden';
                card.style.backgroundColor = 'var(--bg-secondary)';
                card.style.border = '1px solid var(--border-color)';
                card.style.borderRadius = '16px';
                card.style.cursor = 'pointer';
                card.style.minHeight = '140px';
                
                const topRow = document.createElement('div');
                topRow.className = 'd-flex justify-content-between align-items-start mb-3';
                
                const badge = document.createElement('div');
                badge.className = 'rounded-pill fw-bold text-center';
                badge.style.background = 'rgba(255,255,255,0.9)';
                badge.style.color = '#111';
                badge.style.fontSize = '0.7rem';
                badge.style.padding = '6px 12px';
                badge.style.letterSpacing = '0.5px';
                badge.textContent = code;
                topRow.appendChild(badge);
                
                if (removeBtn) {
                    const btnClone = removeBtn.cloneNode(true);
                    btnClone.className = 'btn btn-outline-danger btn-sm rounded-pill';
                    btnClone.style.fontSize = '0.7rem';
                    btnClone.style.padding = '4px 12px';
                    btnClone.style.border = '1px solid rgba(220, 53, 69, 0.3)';
                    btnClone.onclick = (e) => { e.preventDefault(); e.stopPropagation(); removeBtn.click(); };
                    topRow.appendChild(btnClone);
                }
                
                const titleText = document.createElement('div');
                titleText.className = 'text-white fw-bold lh-sm mb-3 mt-2';
                titleText.style.fontSize = '1.1rem';
                titleText.textContent = title || code;
                
                const termText = document.createElement('div');
                termText.className = 'mt-auto fw-medium';
                termText.style.color = '#a0a4b0';
                termText.style.fontSize = '0.8rem';
                termText.textContent = term;
                
                card.appendChild(topRow);
                card.appendChild(titleText);
                card.appendChild(termText);
                
                flexGrid.appendChild(card);
            }
        });
        
        courseTable.style.display = 'none';
        const tableContainer = courseTable.parentElement;
        if (tableContainer) {
            tableContainer.appendChild(flexGrid);
        }
    }
  };

  const overhaulAssessmentsList = () => {
    const table = document.querySelector('table[aria-label="Assessments"]');
    if (!table || table.dataset.urbanized) return;
    table.dataset.urbanized = 'true';

    const cardParent = table.closest('.card');
    if (cardParent) {
        cardParent.style.background = 'transparent';
        cardParent.style.border = 'none';
        cardParent.style.boxShadow = 'none';
        
        const header = cardParent.querySelector('.card-header');
        if (header) {
            const h1 = header.querySelector('h1, h2');
            if (h1) {
                h1.className = 'fs-2 fw-bold text-white mb-4 mt-2';
                cardParent.insertBefore(h1, cardParent.firstChild);
            }
            header.remove();
        }

        const flexContainer = document.createElement('div');
        flexContainer.className = 'd-flex flex-column gap-3 w-100 pb-5';

        const rows = Array.from(table.querySelectorAll('tbody tr'));
        
        rows.forEach(tr => {
            const groupHeader = tr.querySelector('[data-testid="assessment-group-heading"]');
            if (groupHeader) {
                const headingText = groupHeader.textContent.trim();
                const headerDiv = document.createElement('h3');
                headerDiv.className = 'text-white fw-bold fs-4 mb-2 mt-4';
                headerDiv.textContent = headingText;
                flexContainer.appendChild(headerDiv);
                return;
            }

            const tds = tr.querySelectorAll('td');
            if (tds.length === 0) return;
            
            let badgeNode = tr.querySelector('[data-testid="assessment-set-badge"]');
            let linkNode = tr.querySelector('a');
            let popoverBtn = tr.querySelector('button[data-bs-toggle="popover"]');
            let progressNode = tr.querySelector('.progress');
            
            if (linkNode) {
                const card = document.createElement('a');
                card.href = linkNode.href;
                card.className = 'urban-card-hover text-decoration-none p-4 d-flex align-items-center justify-content-between position-relative overflow-hidden';
                card.style.backgroundColor = 'var(--bg-secondary)';
                card.style.border = '1px solid var(--border-color)';
                card.style.borderRadius = '12px';
                card.style.cursor = 'pointer';
                
                const leftSide = document.createElement('div');
                leftSide.className = 'd-flex align-items-center gap-3 z-3 position-relative';
                
                if (badgeNode) {
                    const badge = document.createElement('div');
                    badge.className = 'rounded-pill fw-bold text-center';
                    badge.style.background = 'var(--muted-badge-bg)';
                    badge.style.color = 'var(--text-primary)';
                    badge.style.fontSize = '0.75rem';
                    badge.style.padding = '6px 14px';
                    badge.style.letterSpacing = '0.5px';
                    badge.textContent = badgeNode.textContent.trim();
                    leftSide.appendChild(badge);
                }
                
                const titleWrapper = document.createElement('div');
                titleWrapper.className = 'd-flex flex-column gap-1';
                
                const titleText = document.createElement('div');
                titleText.className = 'text-white fw-bold fs-5';
                titleText.textContent = linkNode.textContent.trim();
                titleWrapper.appendChild(titleText);
                
                const rightSide = document.createElement('div');
                rightSide.className = 'd-flex align-items-center gap-4 z-3 position-relative';
                
                if (popoverBtn) {
                   const contentHtml = popoverBtn.getAttribute('data-bs-content');
                   let deadlineText = '';
                   if (contentHtml) {
                       const tempDiv = document.createElement('div');
                       tempDiv.innerHTML = contentHtml;
                       const rows = Array.from(tempDiv.querySelectorAll('tr'));
                       // Find the last row with > 0% credit
                       for (let i = 1; i < rows.length; i++) {
                           const cells = rows[i].querySelectorAll('td, th');
                           if (cells.length >= 3) {
                               const credit = cells[0].textContent.trim();
                               if (credit !== '0%') {
                                   let endRaw = cells[2].textContent.trim();
                                   if (endRaw && endRaw !== '—' && !endRaw.includes('Never')) {
                                       try {
                                           // "2026-03-01 23:59:59-06 (CST)" -> "03/01 at 23:59"
                                           const parts = endRaw.split(' ');
                                           const dateParts = parts[0].split('-');
                                           const timePart = parts[1].substring(0, 5);
                                           deadlineText = `Due ${dateParts[1]}/${dateParts[2]} at ${timePart}`;
                                       } catch (e) {
                                           deadlineText = `Due: ${endRaw}`;
                                       }
                                   }
                               }
                           }
                       }
                   }
                   
                   if (deadlineText) {
                       const deadlineDiv = document.createElement('div');
                       deadlineDiv.className = 'text-secondary fw-semibold d-flex align-items-center gap-2 mt-1';
                       deadlineDiv.style.fontSize = '0.85rem';
                       deadlineDiv.innerHTML = `<i class="fa fa-calendar-alt opacity-75"></i> ${deadlineText}`;
                       titleWrapper.appendChild(deadlineDiv);
                   } else {
                       popoverBtn.className = 'd-flex align-items-center justify-content-center';
                       popoverBtn.style.color = '#a0a4b0';
                       popoverBtn.style.background = 'transparent';
                       popoverBtn.style.border = 'none';
                       popoverBtn.style.cursor = 'pointer';
                       popoverBtn.style.zIndex = '10';
                       popoverBtn.innerHTML = '<i class="fa fa-clock fs-5"></i>';
                       popoverBtn.onclick = (e) => { e.preventDefault(); e.stopPropagation(); };
                       rightSide.appendChild(popoverBtn);
                   }
                }
                
                leftSide.appendChild(titleWrapper);
                
                if (progressNode) {
                   let rawPercent = progressNode.textContent.trim(); // "100%"
                   let percentNum = parseFloat(rawPercent);
                   if (isNaN(percentNum)) percentNum = 0;
                   if (rawPercent === '') {
                        const styleWidth = progressNode.querySelector('.progress-bar')?.style?.width; // Check inline style occasionally has numbers
                        if (styleWidth) {
                            rawPercent = styleWidth;
                            percentNum = parseFloat(rawPercent);
                            if (isNaN(percentNum)) percentNum = 0;
                        } else {
                            rawPercent = '0%';
                        }
                   }
                   
                   const scoreBadge = document.createElement('div');
                   scoreBadge.className = 'rounded-pill fw-bold d-flex justify-content-center align-items-center';
                   scoreBadge.style.minWidth = '54px';
                   scoreBadge.style.padding = '6px 14px';
                   scoreBadge.style.fontSize = '0.8rem';
                   scoreBadge.textContent = rawPercent;
                   
                   if (percentNum >= 100) {
                      scoreBadge.style.background = 'var(--success-bg)';
                      scoreBadge.style.color = 'var(--success-text)';
                      scoreBadge.style.border = '1px solid var(--success-border)';
                   } else if (percentNum > 0) {
                      scoreBadge.style.background = 'var(--warning-bg)';
                      scoreBadge.style.color = 'var(--warning-text)';
                      scoreBadge.style.border = '1px solid var(--warning-border)';
                   } else {
                      scoreBadge.style.background = 'var(--muted-badge-bg)';
                      scoreBadge.style.color = 'var(--text-secondary)';
                      scoreBadge.style.border = '1px solid var(--muted-badge-border)';
                   }
                   
                   rightSide.appendChild(scoreBadge);
                   
                   const bar = document.createElement('div');
                   bar.className = 'position-absolute bottom-0 start-0 w-100';
                   bar.style.height = '3px';
                   
                   const innerBar = document.createElement('div');
                   innerBar.style.height = '100%';
                   innerBar.style.width = rawPercent;
                   if (percentNum >= 100) {
                      innerBar.style.background = 'var(--progress-green)';
                      innerBar.style.boxShadow = '0 0 10px rgba(76,175,80,0.5)';
                   } else if (percentNum > 0) {
                      innerBar.style.background = 'var(--progress-yellow)';
                      innerBar.style.boxShadow = '0 0 10px rgba(255,193,7,0.5)';
                   } else {
                      innerBar.style.background = 'transparent';
                   }
                   
                   bar.appendChild(innerBar);
                   card.appendChild(bar);
                }
                
                card.appendChild(leftSide);
                card.appendChild(rightSide);
                flexContainer.appendChild(card);
            }
        });
        
        table.style.display = 'none';
        const tableContainer = table.parentElement;
        if (tableContainer) {
            tableContainer.appendChild(flexContainer);
        }
    }
  };

  cleanStyles();
  modernizeLayout();
  
  // Observe mutations for dynamically loaded components
  const observer = new MutationObserver((mutations) => {
    let shouldClean = false;
    for (const mutation of mutations) {
      if (mutation.addedNodes.length > 0) {
        shouldClean = true;
        break;
      }
    }
    if (shouldClean) {
      cleanStyles();
      overhaulCoursesGrid();
      overhaulAssessmentsList();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  injectFloatingButtons(false);
}); // End of `else` block for DOMContentLoaded

} // End of outer `else` block

// Shortcut listener for scraping DOM and CSS to local AI server
document.addEventListener('keydown', async (e) => {
  if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'y') {
    console.log('[UrbanLearn] Scraping page HTML and CSS...');
    
    // Dump HTML
    try {
      await fetch('http://localhost:3010/dump-html', {
        method: 'POST',
        body: document.documentElement.outerHTML
      });
      console.log('[UrbanLearn] HTML sent to local server.');
    } catch (err) {
      console.error('[UrbanLearn] Failed to send HTML.', err);
    }

    // Dump CSS
    try {
      let cssString = '';
      document.querySelectorAll('style').forEach(s => cssString += s.innerHTML + '\n');
      
      const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
      for (const link of links) {
        try {
          const res = await fetch(link.href);
          const text = await res.text();
          cssString += `\n/* from ${link.href} */\n` + text + '\n';
        } catch (cssErr) {
          console.warn('[UrbanLearn] Could not fetch CSS link: ', link.href);
        }
      }
      
      await fetch('http://localhost:3010/dump-css', {
        method: 'POST',
        body: cssString
      });
      console.log('[UrbanLearn] CSS sent to local server.');
    } catch (err) {
      console.error('[UrbanLearn] Failed to send CSS.', err);
    }
  }
});
