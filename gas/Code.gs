function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('YouTubeツール')
    .addItem('サイドバーを開く', 'showSidebar')
    .addToUi();
}

function showSidebar() {
  const html = HtmlService.createHtmlOutputFromFile('sidebar')
    .setTitle('YouTube支援ツール');
  SpreadsheetApp.getUi().showSidebar(html);
}
