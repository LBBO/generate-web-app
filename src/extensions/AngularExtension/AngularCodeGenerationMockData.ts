export const defaultAppModule = `import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'

import { AppComponent } from './app.component'

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
`

export const appModuleWithMoreDeclarations = `import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'

import { AppComponent } from './app.component'

@NgModule({
  declarations: [
    AnotherComponent,
    AppComponent,
    CreativelyNamedComponent,
    MagicalComponent,
    SomeComponent,
  ],
  imports: [BrowserModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
`

export const appModuleWithMoreImports = `import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'

import { AppComponent } from './app.component'

@NgModule({
  declarations: [AppComponent],
  imports: [
    AModule,
    AnotherModule,
    BrowserModule,
    CoolModule,
    DemonstrationModule,
    TestingModule,
    YoMamasModule,
    ZebraModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
`
