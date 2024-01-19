import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaintToolsComponent } from './paint-tools.component';

describe('PaintToolsComponent', () => {
    let component: PaintToolsComponent;
    let fixture: ComponentFixture<PaintToolsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PaintToolsComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(PaintToolsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
