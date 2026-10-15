import pc from 'picocolors';

export function showBanner() {
  console.log(`
${pc.cyan('███╗   ██╗██╗  ██╗██████╗ ')}
${pc.cyan('████╗  ██║╚██╗██╔╝╚════██╗')}
${pc.cyan('██╔██╗ ██║ ╚███╔╝   ███╔╝ ')}  ${pc.bold(pc.white('NX° DEVELOPER EXPERIENCE'))}
${pc.cyan('██║╚██╗██║ ██╔██╗  ██╔══╝  ')}  ${pc.gray('Skiddle API & Front-End Developer Toolkit')}
${pc.cyan('██║ ╚████║██╔╝ ██╗ ███████╗')}  ${pc.magenta('v1.0.0')} • ${pc.green('TypeScript & Node 24')}
${pc.cyan('╚═╝  ╚═══╝╚═╝  ╚═╝ ╚══════╝')}
`);
}
