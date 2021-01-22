
export class DeflectionQueryGenerator {

  public static generateSomeQuery(keywords: string, best: string, match: string, removeStopWords: boolean, maximum: number) {
    // Best practice: use No Syntax Blocks <@- -@> ref https://developers.coveo.com/display/SearchREST/Query+Extension+Language+Basics#QueryExtensionLanguageBasics-UsingNoSyntaxBlocks
    var query = '$some(keywords:<@-' + keywords + '-@>, ';
    if (best !== '') {
      query += 'best: ' + best + ', ';
    }
    query += 'match: ' + match + ', ';
    query += 'removeStopWords: ' + removeStopWords + ', ';
    query += 'maximum: ' + maximum + ')';
    return query;
  }

  public static generateCorrelateUsingIdfQuery(keywords: string, forceMatch: boolean, removeStopWords: boolean, noStemming: boolean, maximum: number) {
    // Best practice: use No Syntax Blocks <@- -@>
    var query = '$correlateUsingIdf(keywords:<@-' + keywords + '-@>, ' + ')';
    query += 'forceOneMatch: ' + forceMatch + ', ';
    query += 'removeStopWords: ' + removeStopWords + ', ';
    query += 'noStemming: ' + noStemming + ', ';
    query += 'maximum: ' + maximum + ')';
    return query;
  }

  public static generateQre(keywords: string, modifier: number) {
    // Best practice: use No Syntax Blocks <@- -@>
    return '$qre(expression:<@-' + keywords + '-@>, modifier: ' + modifier.toString() + ')';
  }

  public static generateFieldQre(keywords: string, field: string, modifier: number) {
    // Best practice: use No Syntax Blocks <@- -@>
    return '$qre(expression:<@-' + field + '=' + keywords + '-@>, modifier: ' + modifier.toString() + ')';
  }

  public static generateType(name: string) {
    return '$type(name: ' + name + ')';
  }

  public static generateSort(criteria: string) {
    return '$sort(criteria: ' + criteria + ')';
  }
}
